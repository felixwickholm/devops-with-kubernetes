const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const LOG_FILE = process.env.LOG_FILE || '/usr/src/app/files/log.txt'
const randomString = crypto.randomUUID()

fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true })

const writeLine = () => {
  const line = `${new Date().toISOString()}: ${randomString}`
  fs.appendFileSync(LOG_FILE, line + '\n')
  console.log(line)
}

writeLine()
setInterval(writeLine, 5000)
