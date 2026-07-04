import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { propertyId, title, price } = await request.json();

    const { data, error } = await resend.emails.send({
      from: 'deal.online <noreply@deal.online>',
      to: ['admin@deal.pk'],
      subject: `New Property Listed: ${title}`,
      html: `
        <h2>New Property Listed on deal.online</h2>
        <p><strong>Title:</strong> ${title}</p>
        <p><strong>Price:</strong> PKR ${price?.toLocaleString()}</p>
        <p><strong>Property ID:</strong> ${propertyId}</p>
        <p><a href="https://deal.online/property/${propertyId}">View Property</a></p>
        <p><a href="https://deal.online/dashboard/admin">Admin Dashboard</a></p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
