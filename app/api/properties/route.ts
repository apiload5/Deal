// app/api/properties/route.ts
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { property } = await request.json()
    const supabase = createServerClient()

    // Get user session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Send email notification
    await resend.emails.send({
      from: 'deal.online <noreply@deal.pk>',
      to: 'admin@deal.pk',
      subject: `New Property Listed: ${property.title}`,
      html: `
        <h2>New Property Listed</h2>
        <p><strong>Title:</strong> ${property.title}</p>
        <p><strong>Price:</strong> PKR ${property.price.toLocaleString()}</p>
        <p><strong>Type:</strong> ${property.property_type}</p>
        <p><strong>Purpose:</strong> ${property.purpose}</p>
        <p><strong>City:</strong> ${property.city_id}</p>
        <p><strong>Posted by:</strong> ${session.user.phone}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/property/${property.id}">View Property</a>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in API route:', error)
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    )
  }
}
