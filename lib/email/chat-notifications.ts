type ClientChatOpenedEmailInput = {
  clientName: string
  projectName: string
  chatSubject: string
  chatDescription: string
  createdDate: string
  clientChatLink: string
}

export const buildClientChatOpenedEmail = ({
  clientName,
  projectName,
  chatSubject,
  chatDescription,
  createdDate,
  clientChatLink,
}: ClientChatOpenedEmailInput) => {
  return {
    subject: `Chat Opened: ${chatSubject}`,
    body: `Hello ${clientName},

This is to inform you that a new chat has been opened by the admin.

Project: ${projectName}
Chat Subject: ${chatSubject}
Description: ${chatDescription || 'No description provided'}
Created Date: ${createdDate}
Status: Open

You can review and continue the conversation through your client dashboard:
${clientChatLink}

Best regards,
Bits3 Project Team`,
  }
}
