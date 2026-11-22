// DummySite controller: watches DummySite objects and creates a Deployment, a Service and an Ingress
// that serve a copy of the page in spec.website_url.
// It calls the Kubernetes REST API directly with the token of its ServiceAccount.
const fs = require('fs')
const https = require('https')

const SA_DIR = '/var/run/secrets/kubernetes.io/serviceaccount'
const API_HOST = process.env.KUBERNETES_SERVICE_HOST
const API_PORT = process.env.KUBERNETES_SERVICE_PORT
const token = fs.readFileSync(`${SA_DIR}/token`, 'utf8')
const ca = fs.readFileSync(`${SA_DIR}/ca.crt`)

const requireEnv = (name) => {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing environment variable ${name}`)
    process.exit(1)
  }
  return value
}

const FETCH_IMAGE = requireEnv('FETCH_IMAGE')
const SERVE_IMAGE = requireEnv('SERVE_IMAGE')
const HOST_SUFFIX = requireEnv('HOST_SUFFIX')

const request = (method, path, body) => new Promise((resolve, reject) => {
  const req = https.request({
    host: API_HOST,
    port: API_PORT,
    method,
    path,
    ca,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  }, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => resolve({ status: res.statusCode, body: data }))
  })
  req.on('error', reject)
  if (body) req.write(JSON.stringify(body))
  req.end()
})

// Creates the object, or does nothing if it already exists (for example after a controller restart).
const create = async (path, object) => {
  const { status, body } = await request('POST', path, object)
  if (status === 201) {
    console.log(`Created ${object.kind} ${object.metadata.namespace}/${object.metadata.name}`)
  } else if (status === 409) {
    console.log(`${object.kind} ${object.metadata.namespace}/${object.metadata.name} already exists`)
  } else {
    throw new Error(`Creating ${object.kind} failed (${status}): ${body}`)
  }
}

const resourcesFor = (site) => {
  const { name, namespace, uid } = site.metadata
  const url = site.spec.website_url
  const appName = `dummysite-${name}`
  const labels = { app: appName, 'dummysite.stable.dwk/name': name }
  // The owner reference makes Kubernetes delete these objects when the DummySite is deleted.
  const metadata = {
    name: appName,
    namespace,
    labels,
    ownerReferences: [{ apiVersion: site.apiVersion, kind: site.kind, name, uid, controller: true, blockOwnerDeletion: true }],
  }
  const deployment = {
    apiVersion: 'apps/v1',
    kind: 'Deployment',
    metadata,
    spec: {
      replicas: 1,
      selector: { matchLabels: { app: appName } },
      template: {
        metadata: { labels },
        spec: {
          volumes: [{ name: 'html', emptyDir: {} }],
          initContainers: [{
            name: 'fetch-site',
            image: FETCH_IMAGE,
            args: ['-sSL', '-A', 'dummysite-controller/1.0', '-o', '/html/index.html', url],
            volumeMounts: [{ name: 'html', mountPath: '/html' }],
          }],
          containers: [{
            name: 'serve-site',
            image: SERVE_IMAGE,
            ports: [{ containerPort: 80 }],
            volumeMounts: [{ name: 'html', mountPath: '/usr/share/nginx/html', readOnly: true }],
          }],
        },
      },
    },
  }
  const service = {
    apiVersion: 'v1',
    kind: 'Service',
    metadata,
    spec: { type: 'ClusterIP', selector: { app: appName }, ports: [{ port: 80, targetPort: 80 }] },
  }
  const ingress = {
    apiVersion: 'networking.k8s.io/v1',
    kind: 'Ingress',
    metadata,
    spec: {
      rules: [{
        host: `${name}.${HOST_SUFFIX}`,
        http: {
          paths: [{
            path: '/',
            pathType: 'Prefix',
            backend: { service: { name: appName, port: { number: 80 } } },
          }],
        },
      }],
    },
  }
  return { deployment, service, ingress }
}

const handleAdded = async (site) => {
  const { name, namespace } = site.metadata
  console.log(`DummySite ${namespace}/${name} added: ${site.spec.website_url}`)
  const { deployment, service, ingress } = resourcesFor(site)
  await create(`/apis/apps/v1/namespaces/${namespace}/deployments`, deployment)
  await create(`/api/v1/namespaces/${namespace}/services`, service)
  await create(`/apis/networking.k8s.io/v1/namespaces/${namespace}/ingresses`, ingress)
  console.log(`DummySite ${namespace}/${name} is served at http://${name}.${HOST_SUFFIX}`)
}

// Streams watch events (one JSON object per line) and restarts the watch when it ends.
const watch = (path, onEvent) => {
  const req = https.request({
    host: API_HOST,
    port: API_PORT,
    method: 'GET',
    path,
    ca,
    headers: { Authorization: `Bearer ${token}` },
  }, (res) => {
    let buffer = ''
    res.on('data', (chunk) => {
      buffer += chunk
      let index
      while ((index = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, index)
        buffer = buffer.slice(index + 1)
        if (line.trim()) onEvent(JSON.parse(line))
      }
    })
    res.on('end', () => setTimeout(() => watch(path, onEvent), 1000))
  })
  req.on('error', (err) => {
    console.error(`Watch failed: ${err.message}`)
    setTimeout(() => watch(path, onEvent), 5000)
  })
  req.end()
}

watch('/apis/stable.dwk/v1/dummysites?watch=true', (event) => {
  if (event.type === 'ADDED') {
    handleAdded(event.object).catch((err) => console.error(err.message))
  } else if (event.type === 'DELETED') {
    // The owned Deployment, Service and Ingress are removed by the garbage collector.
    console.log(`DummySite ${event.object.metadata.namespace}/${event.object.metadata.name} deleted`)
  }
})

console.log('DummySite controller started')
