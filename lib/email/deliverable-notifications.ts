type DeliverableCompletedEmailInput = {
  clientName: string
  projectName: string
  deliverableName: string
  completionDate: string
  progressPercentage: number
  clientDashboardLink: string
}

export const buildDeliverableCompletedEmail = ({
  clientName,
  projectName,
  deliverableName,
  completionDate,
  progressPercentage,
  clientDashboardLink,
}: DeliverableCompletedEmailInput) => {
  return {
    subject: `Deliverable Completed: ${deliverableName}`,
    body: `Hello ${clientName},

We are pleased to inform you that the following deliverable has been completed:

Project: ${projectName}
Deliverable: ${deliverableName}
Completion Date: ${completionDate}
Current Project Progress: ${progressPercentage}%

You can review the project status through your client dashboard:
${clientDashboardLink}

Best regards,
Bits3 Project Team`,
  }
}
