type PaymentReceivedEmailInput = {
  clientName: string
  projectName: string
  paymentDescription: string
  paymentAmount: string
  paymentDate: string
  remainingBalance: string
  clientDashboardLink: string
}

export const buildPaymentReceivedEmail = ({
  clientName,
  projectName,
  paymentDescription,
  paymentAmount,
  paymentDate,
  remainingBalance,
  clientDashboardLink,
}: PaymentReceivedEmailInput) => {
  return {
    subject: `Payment Received: ${paymentDescription}`,
    body: `Hello ${clientName},

We are pleased to confirm that we have received the following payment:

Project: ${projectName}
Payment Description: ${paymentDescription}
Amount Received: ${paymentAmount}
Payment Status: Paid
Payment Date: ${paymentDate}
Remaining Balance: ${remainingBalance}

You can review your payment details and project status through your client dashboard:
${clientDashboardLink}

Thank you for your continued trust and partnership.

Best regards,
Bits3 Project Team`,
  }
}
