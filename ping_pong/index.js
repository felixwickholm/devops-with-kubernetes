const http = require('http')
const { Pool } = require('pg')

const PORT = process.env.PORT || 3000

// Connection settings come from the standard PG* env variables.
const pool = new Pool()

let dbReady = false

const initDb = async () => {
  for (;;) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS counter (
          id INTEGER PRIMARY KEY,
          value INTEGER NOT NULL
        )`)
      await pool.query('INSERT INTO counter (id, value) VALUES (1, 0) ON CONFLICT (id) DO NOTHING')
      console.log('Connected to the database')
      dbReady = true
      return
    } catch (err) {
      console.error(`Database not ready: ${err.message}`)
      await new Promise((resolve) => setTimeout(resolve, 2000))
    }
  }
}

const getCounter = async () => {
  const { rows } = await pool.query('SELECT value FROM counter WHERE id = 1')
  return rows[0].value
}

// Returns the value before the increment.
const incrementCounter = async () => {
  const { rows } = await pool.query('UPDATE counter SET value = value + 1 WHERE id = 1 RETURNING value - 1 AS value')
  return rows[0].value
}

// Ready only when the database answers.
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
  try {
    if (req.method === 'GET' && req.url === '/healthz') {
      const healthy = await isHealthy()
      res.writeHead(healthy ? 200 : 500, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ status: healthy ? 'ok' : 'no database connection' }))
    }
    if (req.method === 'GET' && req.url === '/pingpong') {
      const counter = await incrementCounter()
      res.writeHead(200, { 'Content-Type': 'text/plain' })
      return res.end(`pong ${counter}\n`)
    }
    if (req.method === 'GET' && req.url === '/pings') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      return res.end(JSON.stringify({ pings: await getCounter() }))
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' })
    res.end('Not found\n')
  } catch (err) {
    console.error(err.message)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Database error\n')
  }
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

initDb()
