type ClientWelcomeEmailInput = {
  clientName: string
  username: string
  password: string
  clientDashboardLink: string
}

export const buildClientWelcomeEmail = ({
  clientName,
  username,
  password,
  clientDashboardLink,
}: ClientWelcomeEmailInput) => {
  return {
    subject: 'Welcome to Bits3 Project Dashboard',
    body: `Hello ${clientName},

Welcome to your Bits3 client dashboard.

You can now access your project updates, deliverables, payments, support, meetings, artifacts, and assigned tasks from one secure workspace.

Dashboard Link:
${clientDashboardLink}

Username:
${username}

Password:
${password}

Please keep these login details safe.

Best regards,
Bits3 Project Team`,
  }
}
