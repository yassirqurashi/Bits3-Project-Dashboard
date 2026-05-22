type GmailSendInput = {
  to: string
  subject: string
  body: string
}

const getRequiredEnv = (name: string) => {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

const toBase64Url = (value: string) => {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

const getGmailAccessToken = async () => {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: getRequiredEnv('GMAIL_CLIENT_ID'),
      client_secret: getRequiredEnv('GMAIL_CLIENT_SECRET'),
      refresh_token: getRequiredEnv('GMAIL_REFRESH_TOKEN'),
      grant_type: 'refresh_token',
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.access_token) {
    console.error('Gmail OAuth token refresh failed', data)
    throw new Error(data.error_description || data.error || 'Unable to refresh Gmail access token')
  }

  return data.access_token as string
}

export const sendGmailMessage = async ({ to, subject, body }: GmailSendInput) => {
  const accessToken = await getGmailAccessToken()
  const message = [
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
  ].join('\r\n')

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: toBase64Url(message),
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    console.error('Gmail message send failed', data)
    throw new Error(data.error?.message || 'Unable to send Gmail message')
  }

  return data
}
