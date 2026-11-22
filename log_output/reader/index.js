const fs = require('fs')
const http = require('http')

const PORT = process.env.PORT || 3000
const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/log.txt'
const COUNTER_FILE = process.env.COUNTER_FILE || '/usr/src/app/shared/pingpong.txt'

const readFile = (file, fallback) => {
  try {
    return fs.readFileSync(file, 'utf8')
  } catch {
    return fallback
  }
}

const server = http.createServer((req, res) => {
  const lines = readFile(LOG_FILE, '').trim().split('\n')
  const lastLine = lines[lines.length - 1]
  const pongs = Number(readFile(COUNTER_FILE, '0')) || 0
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(`${lastLine}.\nPing / Pongs: ${pongs}\n`)
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})
