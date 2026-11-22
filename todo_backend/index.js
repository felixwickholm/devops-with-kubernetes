const http = require('http')
const { Pool } = require('pg')

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
const REDIRECT_URL = requireEnv('REDIRECT_URL')
const TODO_MAX_LENGTH = Number(requireEnv('TODO_MAX_LENGTH'))
for (const name of ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) requireEnv(name)

// Connection settings come from the standard PG* env variables.
const pool = new Pool()

let dbReady = false

const initDb = async () => {
  for (;;) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          done BOOLEAN NOT NULL DEFAULT false
        )`)
      console.log('Connected to the database')
      dbReady = true
      return
    } catch (err) {
      console.error(`Database not ready: ${err.message}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}

const readBody = (req) => new Promise((resolve, reject) => {
  let data = ''
  req.on('data', (chunk) => { data += chunk })
  req.on('end', () => resolve(data))
  req.on('error', reject)
})

const parseTodo = (req, body) => {
  if ((req.headers['content-type'] || '').includes('application/json')) {
    return JSON.parse(body || '{}').todo
  }
  return new URLSearchParams(body).get('todo')
}

const isForm = (req) => (req.headers['content-type'] || '').includes('application/x-www-form-urlencoded')

// Logs every request with its status code when the response is sent.
const logRequest = (req, res) => {
  const start = Date.now()
  res.on('finish', () => {
    console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`)
  })
}

// Healthy only when the database answers.
const isHealthy = async () => {
  if (!dbReady) return false
  try {
    await pool.query('SELECT 1')
    return true
  } catch {
    return false
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') {
    const healthy = await isHealthy()
    res.writeHead(healthy ? 200 : 500, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ status: healthy ? 'ok' : 'no database connection' }))
  }
  logRequest(req, res)
  try {
    if (req.url === '/todos' && req.method === 'GET') {
      const { rows } = await pool.query('SELECT id, text, done FROM todos ORDER BY id')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(rows))
    }
    if (req.url === '/todos' && req.method === 'POST') {
      let text
      try {
        text = (parseTodo(req, await readBody(req)) || '').trim()
      } catch {
        text = ''
      }
      console.log(`Received todo: ${JSON.stringify(text)}`)
      if (!text) {
        console.log('Rejected todo: empty')
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'todo is required' }))
      }
      if (text.length > TODO_MAX_LENGTH) {
        console.log(`Rejected todo: ${text.length} characters is over the limit of ${TODO_MAX_LENGTH}`)
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: `todo must be at most ${TODO_MAX_LENGTH} characters` }))
      }
      const { rows } = await pool.query('INSERT INTO todos (text) VALUES ($1) RETURNING id, text, done', [text])
      console.log(`Created todo ${rows[0].id}`)
      // A browser form post is redirected back to the todo app page.
      if (isForm(req)) {
        res.writeHead(302, { Location: REDIRECT_URL })
        return res.end()
      }
      res.writeHead(201, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify(rows[0]))
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found\n')
  } catch (err) {
    console.error(err.message)
    res.writeHead(500, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'database error' }))
  }
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

initDb()

// Exit quickly when Kubernetes stops the container.
process.on('SIGTERM', () => server.close(() => process.exit(0)))
