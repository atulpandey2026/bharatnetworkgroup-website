import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
  if (req?.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }
  try {
    const { type, fullName, email, mobile, company, subject, enquiryType, message, enquiryId, submissionDate, adminEmail: adminEmailParam } = await req?.json();

    const RESEND_API_KEY = (typeof Deno !== "undefined") ? Deno?.env?.get("RESEND_API_KEY") : undefined;
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const adminEmail = adminEmailParam || ((typeof Deno !== "undefined") ? Deno?.env?.get("ADMIN_EMAIL") : undefined) || "contact@bharatnetworkgroup.com";

    if (type === "user") {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [email],
          subject: `Message Received – ${subject} | Bharat Network Group`,
          html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden;">
              <div style="background: #E05A1E; padding: 32px 40px;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Bharat Network Group</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Message Acknowledgement</p>
              </div>
              <div style="padding: 40px;">
                <h2 style="color: #1C1917; font-size: 20px; margin: 0 0 16px;">Dear ${fullName},</h2>
                <p style="color: #78716C; line-height: 1.6; margin: 0 0 24px;">Thank you for contacting Bharat Network Group. We have received your message and our team will get back to you within 24 business hours.</p>
                <div style="background: #F5F0E8; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                  <h3 style="color: #1C1917; font-size: 16px; margin: 0 0 16px;">Enquiry Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px; width: 40%;">Reference ID</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${enquiryId}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Subject</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${subject}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Enquiry Type</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${enquiryType}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Submitted On</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${submissionDate}</td></tr>
                  </table>
                </div>
                <p style="color: #78716C; line-height: 1.6; margin: 0;">Warm regards,<br><strong style="color: #1C1917;">BNG Team</strong><br>Bharat Network Group</p>
              </div>
              <div style="background: #1C1917; padding: 20px 40px; text-align: center;">
                <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">© 2025 Bharat Network Group. Suit G-008, C-127, Sector-63, Noida</p>
              </div>
            </div>
          `,
        }),
      });
    } else if (type === "admin") {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [adminEmail],
          subject: `New Enquiry: ${enquiryType} – ${fullName}`,
          html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden;">
              <div style="background: #1C1917; padding: 32px 40px;">
                <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">New Contact Enquiry</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">BNG Website Contact Form</p>
              </div>
              <div style="padding: 40px;">
                <div style="background: #F5F0E8; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px; width: 40%;">Enquiry ID</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${enquiryId}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Name</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${fullName}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Email</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${email}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Mobile</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${mobile || 'N/A'}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Company</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${company || 'N/A'}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Enquiry Type</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${enquiryType}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Subject</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${subject}</td></tr>
                  </table>
                </div>
                <div style="background: white; border: 1px solid #E7E5E0; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
                  <h3 style="color: #1C1917; font-size: 14px; margin: 0 0 8px;">Message</h3>
                  <p style="color: #78716C; font-size: 14px; line-height: 1.6; margin: 0;">${message}</p>
                </div>
                <a href="${(typeof Deno !== "undefined" ? Deno?.env?.get("SITE_URL") : undefined) || "https://bharatnetw2824.builtwithrocket.new"}/admin/contact-enquiries" style="display: inline-block; background: #E05A1E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View in Admin Panel</a>
              </div>
            </div>
          `,
        }),
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
