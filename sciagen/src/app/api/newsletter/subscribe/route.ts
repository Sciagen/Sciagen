import { NextRequest, NextResponse } from 'next/server';
import { adminDb_ }                  from '@/lib/firebase/admin';
import { z }                         from 'zod';
import { nanoid }                    from 'nanoid';

const schema = z.object({
  email:   z.string().email(),
  name:    z.string().optional(),
  domains: z.array(z.string()).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    const { email, name, domains } = parsed.data;

    // Check existing
    const existing = await adminDb_
      .collection('newsletter_subscribers')
      .where('email', '==', email)
      .limit(1)
      .get();

    if (!existing.empty) {
      return NextResponse.json({ message: 'Already subscribed' }, { status: 200 });
    }

    // Store subscriber
    await adminDb_.collection('newsletter_subscribers').add({
      id:        nanoid(),
      email,
      name:      name ?? null,
      domains:   domains ?? [],
      confirmed: false,
      createdAt: new Date().toISOString(),
    });

    // TODO: Send confirmation email via Resend
    // await resend.emails.send({ to: email, subject: 'Confirm your Sciagen subscription', ... })

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Newsletter subscribe error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
