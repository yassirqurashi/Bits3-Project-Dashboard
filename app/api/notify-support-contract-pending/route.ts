import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'
import { sendGmailMessage } from '../../../lib/email/gmail'
import { buildSupportContractApprovalEmail } from '../../../lib/email/support-contract-notifications'

const getClientSupportLink = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
  const baseUrl = explicitUrl || vercelUrl || 'http://localhost:3000'

  return `${baseUrl.replace(/\/$/, '')}/client-support`
}

const formatNumber = (value: unknown) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

export async function POST(request: Request) {
  try {
    const { contractId } = await request.json()

    if (!contractId) {
      return NextResponse.json({ error: 'Support contract is required' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: contract, error: contractError } = await supabaseAdmin
      .from('support_contracts')
      .select('id, client_id, project_id, name, monthly_support_fee, included_hours_per_month, duration_days, client_approval_status')
      .eq('id', contractId)
      .single()

    if (contractError || !contract) {
      return NextResponse.json({ error: 'Support contract not found' }, { status: 404 })
    }

    if ((contract.client_approval_status || 'Approved') !== 'Pending') {
      return NextResponse.json({ skipped: true, reason: 'Support contract is not pending approval' })
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('id', contract.client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client email is missing' }, { status: 400 })
    }

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('id, name')
      .eq('id', contract.project_id)
      .single()

    const email = buildSupportContractApprovalEmail({
      clientName: client.name || 'Client',
      projectName: project?.name || 'Project',
      contractName: contract.name || 'Support Contract',
      monthlySupportFee: formatNumber(contract.monthly_support_fee),
      includedHours: `${formatNumber(contract.included_hours_per_month)} hours`,
      durationDays: `${formatNumber(contract.duration_days)} days`,
      approvalLink: getClientSupportLink(),
    })

    await sendGmailMessage({
      to: client.email,
      subject: email.subject,
      body: email.body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Support contract pending approval email failed', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send support contract notification' },
      { status: 500 }
    )
  }
}
