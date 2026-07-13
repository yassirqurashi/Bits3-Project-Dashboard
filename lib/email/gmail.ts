import net from 'node:net'
import tls from 'node:tls'

type EmailSendInput = {
  to: string
  subject: string
  body: string
}

type SmtpSocket = net.Socket | tls.TLSSocket

const getRequiredEnv = (name: string, fallback = '') => {
  const value = process.env[name] || fallback

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const normalizeLineEndings = (value: string) => value.replace(/\r?\n/g, '\r\n')

const dotStuff = (value: string) =>
  normalizeLineEndings(value)
    .split('\r\n')
    .map(line => line.startsWith('.') ? `.${line}` : line)
    .join('\r\n')

const encodeHeader = (value: string) => {
  if (/^[\x20-\x7E]*$/.test(value)) return value.replace(/[\r\n]/g, ' ')
  return `=?UTF-8?B?${Buffer.from(value.replace(/[\r\n]/g, ' '), 'utf8').toString('base64')}?=`
}

const getEmailAddress = (value: string) => {
  const match = value.match(/<([^>]+)>/)
  return (match?.[1] || value).trim()
}

const readSmtpResponse = (socket: SmtpSocket) => new Promise<{ code: number; message: string }>((resolve, reject) => {
  let buffer = ''

  const cleanup = () => {
    socket.off('data', onData)
    socket.off('error', onError)
    socket.off('end', onEnd)
  }

  const onError = (error: Error) => {
    cleanup()
    reject(error)
  }

  const onEnd = () => {
    cleanup()
    reject(new Error('SMTP connection closed unexpectedly'))
  }

  const onData = (chunk: Buffer) => {
    buffer += chunk.toString('utf8')
    const lines = buffer.split(/\r?\n/).filter(Boolean)
    const lastLine = lines[lines.length - 1]

    if (/^\d{3} /.test(lastLine || '')) {
      cleanup()
      resolve({
        code: Number(lastLine.slice(0, 3)),
        message: lines.join('\n'),
      })
    }
  }

  socket.on('data', onData)
  socket.on('error', onError)
  socket.on('end', onEnd)
})

const expectSmtpResponse = async (socket: SmtpSocket, expectedCodes: number[]) => {
  const response = await readSmtpResponse(socket)

  if (!expectedCodes.includes(response.code)) {
    throw new Error(`SMTP error ${response.code}: ${response.message}`)
  }

  return response
}

const sendSmtpCommand = async (socket: SmtpSocket, command: string, expectedCodes: number[]) => {
  socket.write(`${command}\r\n`)
  return expectSmtpResponse(socket, expectedCodes)
}

const connectSmtp = (host: string, port: number, secure: boolean) => new Promise<SmtpSocket>((resolve, reject) => {
  const socket = secure
    ? tls.connect({ host, port, servername: host })
    : net.connect({ host, port })

  socket.setTimeout(30000)

  const cleanup = () => {
    socket.off('connect', onConnect)
    socket.off('secureConnect', onConnect)
    socket.off('error', onError)
    socket.off('timeout', onTimeout)
  }

  const onConnect = () => {
    cleanup()
    resolve(socket)
  }

  const onError = (error: Error) => {
    cleanup()
    reject(error)
  }

  const onTimeout = () => {
    cleanup()
    socket.destroy()
    reject(new Error('SMTP connection timed out'))
  }

  socket.once(secure ? 'secureConnect' : 'connect', onConnect)
  socket.once('error', onError)
  socket.once('timeout', onTimeout)
})

const buildMessage = ({ to, subject, body, from }: EmailSendInput & { from: string }) => [
  `From: ${from}`,
  `To: ${to}`,
  `Subject: ${encodeHeader(subject)}`,
  'MIME-Version: 1.0',
  'Content-Type: text/plain; charset="UTF-8"',
  'Content-Transfer-Encoding: 8bit',
  `Date: ${new Date().toUTCString()}`,
  '',
  dotStuff(body),
].join('\r\n')

export const sendGmailMessage = async ({ to, subject, body }: EmailSendInput) => {
  const host = getRequiredEnv('SMTP_HOST', 'smtp.hostinger.com')
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = (process.env.SMTP_SECURE || 'true').toLowerCase() !== 'false'
  const user = getRequiredEnv('SMTP_USER')
  const password = getRequiredEnv('SMTP_PASSWORD')
  const from = process.env.EMAIL_FROM || user
  const socket = await connectSmtp(host, port, secure)

  try {
    await expectSmtpResponse(socket, [220])
    await sendSmtpCommand(socket, `EHLO ${host}`, [250])
    await sendSmtpCommand(
      socket,
      `AUTH PLAIN ${Buffer.from(`\u0000${user}\u0000${password}`).toString('base64')}`,
      [235]
    )
    await sendSmtpCommand(socket, `MAIL FROM:<${getEmailAddress(from)}>`, [250])
    await sendSmtpCommand(socket, `RCPT TO:<${getEmailAddress(to)}>`, [250, 251])
    await sendSmtpCommand(socket, 'DATA', [354])

    socket.write(`${buildMessage({ to, subject, body, from })}\r\n.\r\n`)
    await expectSmtpResponse(socket, [250])
    await sendSmtpCommand(socket, 'QUIT', [221])

    return { success: true }
  } finally {
    socket.end()
  }
}
