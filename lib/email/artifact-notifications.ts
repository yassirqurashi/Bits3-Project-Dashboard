type ArtifactPendingApprovalEmailInput = {
  clientName: string
  projectName: string
  artifactName: string
  artifactDescription: string
  creationDate: string
  fileName: string
  artifactLink: string
}

export const buildArtifactPendingApprovalEmail = ({
  clientName,
  projectName,
  artifactName,
  artifactDescription,
  creationDate,
  fileName,
  artifactLink,
}: ArtifactPendingApprovalEmailInput) => {
  return {
    subject: `Artifact Pending Approval: ${artifactName}`,
    body: `Hello ${clientName},

A new artifact has been uploaded and is pending your approval.

Project: ${projectName}
Artifact: ${artifactName}
Description: ${artifactDescription || 'No description provided'}
Creation Date: ${creationDate}
File Name: ${fileName || 'Uploaded file'}
Approval Status: Pending Approval

You can download, review, and approve the artifact through your client dashboard:
${artifactLink}

Best regards,
Bits3 Project Team`,
  }
}
