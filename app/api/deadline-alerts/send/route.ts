import { NextRequest, NextResponse } from 'next/server';
import { listDueDeadlineAlerts, markDeadlineAlertSent } from '@/lib/firestore/deadline-alerts';

function authorized(request: NextRequest) {
  const secret = process.env.DEADLINE_ALERT_CRON_SECRET;
  if (!secret) return false;
  return request.headers.get('authorization') === `Bearer ${secret}`;
}

async function sendReminderEmail(alert: { email: string; programName: string; deadline: string; applicationUrl: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.DEADLINE_ALERT_FROM_EMAIL;
  if (!apiKey || !from) {
    throw new Error('Email delivery is not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: alert.email,
      subject: `Reminder: ${alert.programName} deadline is coming up`,
      text: `This is your Aid Center reminder to finish the ${alert.programName} form. Deadline: ${alert.deadline}. Apply here: ${alert.applicationUrl}`,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email provider returned ${response.status}`);
  }
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const alerts = await listDueDeadlineAlerts();
    const results = await Promise.allSettled(alerts.map(async (alert) => {
      await sendReminderEmail(alert);
      if (alert.id) {
        await markDeadlineAlertSent(alert.id);
      }
    }));

    return NextResponse.json({
      checked: alerts.length,
      sent: results.filter((result) => result.status === 'fulfilled').length,
      failed: results.filter((result) => result.status === 'rejected').length,
    });
  } catch (error) {
    console.error('Error sending deadline alerts:', error);
    return NextResponse.json({ error: 'Failed to send deadline alerts' }, { status: 500 });
  }
}
