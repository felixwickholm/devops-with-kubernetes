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
for (const name of ['PGHOST', 'PGUSER', 'PGPASSWORD', 'PGDATABASE']) requireEnv(name)

// Connection settings come from the standard PG* env variables.
const pool = new Pool()

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

const server = http.createServer(async (req, res) => {
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
      if (!text) {
        res.writeHead(400, { 'Content-Type': 'application/json' })
        return res.end(JSON.stringify({ error: 'todo is required' }))
      }
      const { rows } = await pool.query('INSERT INTO todos (text) VALUES ($1) RETURNING id, text, done', [text])
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

initDb().then(() => {
  server.listen(PORT, () => {
    console.log(`Server started in port ${PORT}`)
  })
})
