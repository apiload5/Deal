// app/api/send-email/route.ts
import { Resend } from "resend"
import { NextResponse } from "next/server"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { propertyId, title, price } = await request.json()

    // In production, get admin email from settings
    const adminEmail = "admin@deal.pk"

    const { data, error } = await resend.emails.send({
      from: "deal.online <noreply@deal.pk>",
      to: [adminEmail],
      subject: `New Property Listed: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563EB;">New Property Listed on deal.online</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Price:</strong> PKR ${parseInt(price).toLocaleString()}</p>
            <p><strong>Property ID:</strong> ${propertyId}</p>
            <p><strong>Listing Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
          <div style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/property/${propertyId}" 
               style="background: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              View Property
            </a>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/admin" 
               style="margin-left: 10px; background: #6B7280; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Admin Panel
            </a>
          </div>
          <p style="margin-top: 20px; color: #6B7280; font-size: 14px;">
            This is an automated notification from deal.online
          </p>
        </div>
      `,
    })

    if (error) {
      console.error("Email error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Email API error:", error)
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    )
  }
}
