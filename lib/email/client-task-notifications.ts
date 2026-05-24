type ClientTaskCreatedEmailInput = {
  clientName: string
  projectName: string
  taskTitle: string
  creationDate: string
  dueDate: string
  status: string
  taskLink: string
}

export const buildClientTaskCreatedEmail = ({
  clientName,
  projectName,
  taskTitle,
  creationDate,
  dueDate,
  status,
  taskLink,
}: ClientTaskCreatedEmailInput) => {
  return {
    subject: `New Client Task Assigned: ${taskTitle}`,
    body: `Hello ${clientName},

This is to inform you that a new task has been assigned to you by the admin.

Project: ${projectName}
Task: ${taskTitle}
Creation Date: ${creationDate}
Due Date: ${dueDate}
Status: ${status}

You can review your assigned tasks through your client dashboard:
${taskLink}

Best regards,
Bits3 Project Team`,
  }
}
