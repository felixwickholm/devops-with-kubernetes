const { connect, JSONCodec } = require('nats')

// All configuration comes from the environment (see manifests/configmap.yaml).
const requireEnv = (name) => {
  const value = process.env[name]
  if (!value) {
    console.error(`Missing environment variable ${name}`)
    process.exit(1)
  }
  return value
}

const NATS_URL = requireEnv('NATS_URL')
const NATS_SUBJECT = requireEnv('NATS_SUBJECT')
const NATS_QUEUE = requireEnv('NATS_QUEUE')
// Without WEBHOOK_URL the broadcaster only logs the messages.
const WEBHOOK_URL = process.env.WEBHOOK_URL || ''

const jsonCodec = JSONCodec()

const toMessage = ({ action, todo }) => {
  const status = todo.done ? 'done' : 'not done'
  return `A todo was ${action}: "${todo.text}" (id ${todo.id}, ${status})`
}

const forward = async (message) => {
  if (!WEBHOOK_URL) {
    console.log(`Message (not forwarded): ${message}`)
    return
  }
  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user: 'bot', message }),
  })
  console.log(`Forwarded (${res.status}): ${message}`)
}

const main = async () => {
  const nats = await connect({ servers: NATS_URL, maxReconnectAttempts: -1 })
  console.log(`Connected to NATS at ${NATS_URL}`)
  // With a queue group, each message goes to only one broadcaster replica.
  const subscription = nats.subscribe(NATS_SUBJECT, { queue: NATS_QUEUE })
  process.on('SIGTERM', async () => {
    await nats.drain()
    process.exit(0)
  })
  for await (const msg of subscription) {
    try {
      await forward(toMessage(jsonCodec.decode(msg.data)))
    } catch (err) {
      console.error(`Could not forward a message: ${err.message}`)
    }
  }
}

main().catch((err) => {
  console.error(err.message)
  process.exit(1)
})
