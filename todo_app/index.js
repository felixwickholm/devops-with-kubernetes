const fs = require('fs')
const http = require('http')
const path = require('path')

// All configuration comes from the environment (see manifests/configmap.yaml).
const requireEnv = (name) => {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing environment variable ${name}`)
    process.exit(1)
  }
  return value
}

const PORT = requireEnv('PORT')
const IMAGE_DIR = requireEnv('IMAGE_DIR')
const IMAGE_URL = requireEnv('IMAGE_URL')
const TODO_BACKEND_URL = requireEnv('TODO_BACKEND_URL')
const IMAGE_TTL_MS = Number(requireEnv('IMAGE_TTL_MINUTES')) * 60 * 1000

const imageFile = path.join(IMAGE_DIR, 'image.jpg')
const metaFile = path.join(IMAGE_DIR, 'image.json')

fs.mkdirSync(IMAGE_DIR, { recursive: true })

let fetching = null

const fetchImage = async () => {
  const res = await fetch(IMAGE_URL)
  if (!res.ok) throw new Error(`Image fetch failed: ${res.status}`)
  const data = Buffer.from(await res.arrayBuffer())
  fs.writeFileSync(imageFile, data)
  fs.writeFileSync(metaFile, JSON.stringify({ fetchedAt: Date.now() }))
  console.log('Fetched a new image')
}

const refreshImage = () => {
  if (!fetching) {
    fetching = fetchImage()
      .catch((err) => console.error(err.message))
      .finally(() => { fetching = null })
  }
  return fetching
}

const imageAge = () => {
  try {
    const { fetchedAt } = JSON.parse(fs.readFileSync(metaFile, 'utf8'))
    return Date.now() - fetchedAt
  } catch {
    return Infinity
  }
}

// Serves the cached image. When the image is older than the TTL,
// the old image is served one more time and a new one is fetched for the next request.
const serveImage = async (res) => {
  if (!fs.existsSync(imageFile)) {
    await refreshImage()
  } else if (imageAge() > IMAGE_TTL_MS) {
    refreshImage()
  }
  if (!fs.existsSync(imageFile)) {
    res.writeHead(503, { 'Content-Type': 'text/plain' })
    return res.end('Image not available\n')
  }
  res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'no-store' })
  fs.createReadStream(imageFile).pipe(res)
}

const getTodos = async () => {
  try {
    const res = await fetch(TODO_BACKEND_URL)
    return await res.json()
  } catch (err) {
    console.error(`Could not get todos: ${err.message}`)
    return []
  }
}

const escapeHtml = (text) => text
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// Set to false by the "Break the app" button. The liveness probe then restarts the container.
let isHealthy = true

// Ready when the app is not broken and the backend answers.
const isReady = async () => {
  if (!isHealthy) return false
  try {
    const res = await fetch(TODO_BACKEND_URL)
    return res.ok
  } catch {
    return false
  }
}

const sendJson = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

const page = (todos) => `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>The project App</title>
  </head>
  <body>
    <h1>The project App</h1>
    <img src="/image" alt="Random image" width="600">
    <form method="POST" action="/todos">
      <input type="text" name="todo" maxlength="140" placeholder="New todo (max 140 characters)" required>
      <button type="submit">Create todo</button>
    </form>
    <ul>
      ${todos.map((todo) => `<li>${escapeHtml(todo.text)}</li>`).join('\n      ')}
    </ul>
    <form method="POST" action="/break">
      <button type="submit">Break the app</button>
    </form>
    <p>DevOps with Kubernetes 2026</p>
  </body>
</html>
`

const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') {
    return sendJson(res, isHealthy ? 200 : 500, { status: isHealthy ? 'ok' : 'unhealthy' })
  }
  if (req.url === '/readyz') {
    const ready = await isReady()
    return sendJson(res, ready ? 200 : 500, { status: ready ? 'ok' : 'not ready' })
  }
  if (!isHealthy) {
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    return res.end('The app is broken. Kubernetes will restart it soon.\n')
  }
  if (req.method === 'POST' && req.url === '/break') {
    console.log('The app was broken on purpose')
    isHealthy = false
    res.writeHead(302, { Location: '/' })
    return res.end()
  }
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    return res.end(page(await getTodos()))
  }
  if (req.method === 'GET' && req.url === '/image') {
    return serveImage(res)
  }
  res.writeHead(404, { 'Content-Type': 'text/plain' })
  res.end('Not found\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

// Exit quickly when Kubernetes stops the container.
process.on('SIGTERM', () => server.close(() => process.exit(0)))
