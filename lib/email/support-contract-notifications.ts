type SupportContractApprovalEmailInput = {
  clientName: string
  projectName: string
  contractName: string
  monthlySupportFee: string
  includedHours: string
  durationDays: string
  approvalLink: string
}

export const buildSupportContractApprovalEmail = ({
  clientName,
  projectName,
  contractName,
  monthlySupportFee,
  includedHours,
  durationDays,
  approvalLink,
}: SupportContractApprovalEmailInput) => {
  return {
    subject: `Support Contract Pending Approval: ${contractName}`,
    body: `Hello ${clientName},

A new support contract is pending your approval.

Project: ${projectName}
Support Contract: ${contractName}
Monthly Support Fee: ${monthlySupportFee}
Included Support Hours: ${includedHours}
Contract Duration: ${durationDays}
Approval Status: Pending Approval

You can review and approve the support contract through your client dashboard:
${approvalLink}

Best regards,
Bits3 Project Team`,
  }
}
