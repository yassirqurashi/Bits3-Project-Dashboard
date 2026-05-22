import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl } from '../../../lib/supabase/config'
import { sendGmailMessage } from '../../../lib/email/gmail'
import { buildPaymentReceivedEmail } from '../../../lib/email/payment-notifications'

const PROJECT_VALUE_PAYMENT_TERM = '__PROJECT_VALUE__'

const getClientDashboardLink = () => {
  const explicitUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL
  const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''
  const baseUrl = explicitUrl || vercelUrl || 'http://localhost:3000'

  return `${baseUrl.replace(/\/$/, '')}/client-dashboard`
}

const parseMoneyValue = (value: unknown) => {
  const parsed = Number(String(value || '').replace(/,/g, '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

const formatMoney = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(value)
}

const calculatePaymentValue = (projectValue: number, paymentPercentage: number) => {
  if (projectValue > 0) {
    return (projectValue * paymentPercentage) / 100
  }

  return paymentPercentage
}

export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json()

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment is required' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
    }

    const supabaseAdmin = createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('id, project_id, term, amount, is_paid, due_upon')
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    if (!payment.is_paid || payment.term === PROJECT_VALUE_PAYMENT_TERM) {
      return NextResponse.json({ skipped: true, reason: 'Payment is not marked as paid' })
    }

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('id, name, client_id')
      .eq('id', payment.project_id)
      .single()

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, name, email')
      .eq('id', project.client_id)
      .single()

    if (clientError || !client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 })
    }

    if (!client.email) {
      return NextResponse.json({ error: 'Client email is missing' }, { status: 400 })
    }

    const { data: projectPayments, error: projectPaymentsError } = await supabaseAdmin
      .from('payments')
      .select('id, term, amount, is_paid, due_upon')
      .eq('project_id', project.id)

    if (projectPaymentsError) {
      throw projectPaymentsError
    }

    const projectValuePayment = projectPayments?.find((item: { term: string }) => item.term === PROJECT_VALUE_PAYMENT_TERM)
    const projectValue = parseMoneyValue(projectValuePayment?.due_upon)
    const totalPaidAmount = (projectPayments || [])
      .filter((item: { term: string; is_paid: boolean }) => item.term !== PROJECT_VALUE_PAYMENT_TERM && item.is_paid)
      .reduce((sum: number, item: { amount: number }) => {
        return sum + calculatePaymentValue(projectValue, Number(item.amount || 0))
      }, 0)
    const paymentAmount = calculatePaymentValue(projectValue, Number(payment.amount || 0))
    const remainingBalance = Math.max(projectValue - totalPaidAmount, 0)
    const paymentDate = new Date().toLocaleDateString('en-GB')
    const email = buildPaymentReceivedEmail({
      clientName: client.name || 'Client',
      projectName: project.name || 'Project',
      paymentDescription: payment.term || 'Payment',
      paymentAmount: formatMoney(paymentAmount),
      paymentDate,
      remainingBalance: formatMoney(remainingBalance),
      clientDashboardLink: getClientDashboardLink(),
    })

    await sendGmailMessage({
      to: client.email,
      subject: email.subject,
      body: email.body,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment received email failed', error)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to send payment notification' },
      { status: 500 }
    )
  }
}
