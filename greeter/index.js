const http = require('http')

const requireEnv = (name) => {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing environment variable ${name}`)
    process.exit(1)
  }
  return value
}

const PORT = requireEnv('PORT')
const GREETING = requireEnv('GREETING')

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.end(GREETING)
})

server.listen(PORT, () => {
  console.log(`Server started in port ${PORT}`)
})

process.on('SIGTERM', () => server.close(() => process.exit(0)))
