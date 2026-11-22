const fs = require('fs')
const http = require('http')

const PORT = process.env.PORT || 3000
const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/log.txt'
const INFO_FILE = process.env.INFO_FILE || '/usr/src/app/config/information.txt'
const MESSAGE = process.env.MESSAGE || ''
const PINGPONG_URL = process.env.PINGPONG_URL || 'http://ping-pong-svc:2345/pings'

const lastLogLine = () => {
  try {
    const lines = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n')
    return lines[lines.length - 1]
  } catch {
    return ''
  }
}

const fileContent = () => {
  try {
    return fs.readFileSync(INFO_FILE, 'utf8').trim()
  } catch {
    return ''
  }
}

const getPongs = async () => {
  try {
    const res = await fetch(PINGPONG_URL)
    const { pings } = await res.json()
    return pings
  } catch (err) {
    console.error(`Could not get pongs: ${err.message}`)
    return 'unavailable'
  }
}

// Ready only when the Ping-pong app answers.
const pingPongAvailable = async () => {
  try {
    const res = await fetch(PINGPONG_URL)
    return res.ok
  } catch {
    return false
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/healthz') {
    const healthy = await pingPongAvailable()
    res.writeHead(healthy ? 200 : 500, { 'Content-Type': 'application/json' })
    return res.end(JSON.stringify({ status: healthy ? 'ok' : 'ping-pong not available' }))
  }
  const pongs = await getPongs()
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end([
    `file content: ${fileContent()}`,
    `env variable: MESSAGE=${MESSAGE}`,
    `${lastLogLine()}.`,
    `Ping / Pongs: ${pongs}`,
  ].join('\n') + '\n')
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
