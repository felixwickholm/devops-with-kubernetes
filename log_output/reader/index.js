const fs = require('fs')
const http = require('http')

const PORT = process.env.PORT || 3000
const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/log.txt'
const PINGPONG_URL = process.env.PINGPONG_URL || 'http://ping-pong-svc:2345/pings'

const lastLogLine = () => {
  try {
    const lines = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n')
    return lines[lines.length - 1]
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

const server = http.createServer(async (req, res) => {
  const pongs = await getPongs()
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(`${lastLogLine()}.\nPing / Pongs: ${pongs}\n`)
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
