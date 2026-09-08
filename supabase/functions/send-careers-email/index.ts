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
    const { type, candidateName, candidateEmail, position, applicationId, submissionDate, mobile, experience, currentCompany, resumeUrl, hrEmail } = await req?.json();

    const RESEND_API_KEY = (typeof Deno !== "undefined" ? Deno?.env?.get("RESEND_API_KEY") : undefined);
    if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not configured");

    const adminEmail = hrEmail || (typeof Deno !== "undefined" ? Deno?.env?.get("HR_EMAIL") : undefined) || "contact@bharatnetworkgroup.com";

    if (type === "candidate") {
      // Acknowledgement email to candidate
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [candidateEmail],
          subject: `Application Received – ${position} | Bharat Network Group`,
          html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden;">
              <div style="background: #E05A1E; padding: 32px 40px;">
                <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700;">Bharat Network Group</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Application Acknowledgement</p>
              </div>
              <div style="padding: 40px;">
                <h2 style="color: #1C1917; font-size: 20px; margin: 0 0 16px;">Dear ${candidateName},</h2>
                <p style="color: #78716C; line-height: 1.6; margin: 0 0 24px;">Thank you for applying to Bharat Network Group. We have successfully received your application and our HR team will review it shortly.</p>
                <div style="background: #F5F0E8; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                  <h3 style="color: #1C1917; font-size: 16px; margin: 0 0 16px;">Application Details</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px; width: 40%;">Application ID</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${applicationId}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Position Applied</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${position}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Submission Date</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${submissionDate}</td></tr>
                  </table>
                </div>
                <p style="color: #78716C; line-height: 1.6; margin: 0 0 16px;">We will contact you if your profile matches our requirements. The process typically takes 5–7 business days.</p>
                <p style="color: #78716C; line-height: 1.6; margin: 0;">Warm regards,<br><strong style="color: #1C1917;">HR Team</strong><br>Bharat Network Group</p>
              </div>
              <div style="background: #1C1917; padding: 20px 40px; text-align: center;">
                <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin: 0;">© 2025 Bharat Network Group. Suit G-008, C-127, Sector-63, Noida</p>
              </div>
            </div>
          `,
        }),
      });
    } else if (type === "admin") {
      // Notification email to HR/Admin
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "onboarding@resend.dev",
          to: [adminEmail],
          subject: `New Application: ${position} – ${candidateName}`,
          html: `
            <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFAF7; border-radius: 12px; overflow: hidden;">
              <div style="background: #1C1917; padding: 32px 40px;">
                <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700;">New Job Application Received</h1>
                <p style="color: rgba(255,255,255,0.6); margin: 8px 0 0; font-size: 14px;">BNG Careers Portal</p>
              </div>
              <div style="padding: 40px;">
                <div style="background: #F5F0E8; border-radius: 12px; padding: 24px; margin: 0 0 24px;">
                  <h3 style="color: #1C1917; font-size: 16px; margin: 0 0 16px;">Candidate Information</h3>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px; width: 40%;">Application ID</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${applicationId}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Name</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${candidateName}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Email</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${candidateEmail}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Mobile</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${mobile || 'N/A'}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Position</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${position}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Experience</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${experience || 'N/A'}</td></tr>
                    <tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Current Company</td><td style="color: #1C1917; font-weight: 600; font-size: 14px;">${currentCompany || 'N/A'}</td></tr>
                    ${resumeUrl ? `<tr><td style="color: #78716C; padding: 6px 0; font-size: 14px;">Resume</td><td style="font-size: 14px;"><a href="${resumeUrl}" style="color: #E05A1E;">View Resume</a></td></tr>` : ''}
                  </table>
                </div>
                <a href="${(typeof Deno !== "undefined" ? Deno?.env?.get("SITE_URL") : undefined) || "https://bharatnetw2824.builtwithrocket.new"}/admin/careers/applications" style="display: inline-block; background: #E05A1E; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">View in Admin Panel</a>
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
