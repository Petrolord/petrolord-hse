import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'https://esm.sh/nodemailer@6.9.13'
import { corsHeaders } from './cors.ts'

// SMTP Configuration from Environment Variables
const SMTP_HOST = Deno.env.get('BREVO_SMTP_HOST')
const SMTP_PORT = parseInt(Deno.env.get('BREVO_SMTP_PORT') || '587')
const SMTP_USER = Deno.env.get('BREVO_SMTP_USER')
const SMTP_PASS = Deno.env.get('BREVO_SMTP_PASSWORD')
const SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || 'no-reply@petrolord.com'
const SENDER_NAME = Deno.env.get('BREVO_SENDER_NAME') || 'Petrolord HSE'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabaseAdmin = createClient(
  SUPABASE_URL ?? '',
  SUPABASE_SERVICE_ROLE_KEY ?? ''
)

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. REQUEST PARSING
    const { email, role, org_id, invited_by, is_resend } = await req.json()

    console.log(`🚀 [Edge] Processing invite. Email: ${email}, Org: ${org_id}, IsResend: ${is_resend}`);

    // 2. VALIDATION CHECKS
    if (!email || !org_id) {
      console.error("❌ [Edge] Missing required fields: email or org_id");
      throw new Error('Email and Organization ID are required fields.')
    }

    // Verify SMTP Configuration is present
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
      console.error("❌ [Edge] Missing SMTP Credentials in Environment Variables");
      throw new Error('Server configuration error: Brevo SMTP credentials not fully configured.');
    }

    // 3. DATABASE SEARCH (Idempotency Check)
    const { data: existingInvites, error: searchError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('org_id', org_id)
      .eq('email', email)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)

    if (searchError) {
      console.error("❌ [Edge] Database search error:", searchError);
      throw new Error("Failed to verify existing invitations.");
    }

    let inviteData;
    const newToken = crypto.randomUUID();

    if (existingInvites && existingInvites.length > 0) {
      // 4a. UPDATE PATH (Resend)
      const existing = existingInvites[0];
      console.log(`✅ [Edge] Found existing invite ID: ${existing.id}. Updating...`);

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('invitations')
        .update({ 
          token: newToken,
          created_at: new Date().toISOString(), // Update timestamp
          invited_by: invited_by || existing.invited_by,
          role: role || existing.role
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (updateError) {
        console.error("❌ [Edge] Update error:", updateError);
        throw new Error("Failed to update invitation record.");
      }
      inviteData = updated;

    } else {
      // 4b. CREATE PATH (New Invite)
      console.log("✨ [Edge] Creating new invitation...");
      
      const { data: inserted, error: insertError } = await supabaseAdmin
        .from('invitations')
        .insert({
          org_id,
          email,
          role: role || 'member',
          invited_by,
          status: 'pending',
          token: newToken
        })
        .select()
        .single();

      if (insertError) {
        console.error("❌ [Edge] Insert error:", insertError);
        // Handle duplicate key error gracefully if needed
        if (insertError.code === '23505') {
             throw new Error("An invitation for this email already exists.");
        }
        throw new Error("Failed to create invitation record.");
      }
      inviteData = inserted;
    }

    // 5. EMAIL CONSTRUCTION
    // Construct Link using Origin header or fallback
    const origin = req.headers.get('origin') || 'https://petrolord-hse.vercel.app';
    const inviteLink = `${origin}/accept-invite/${inviteData.token}`;

    console.log(`📧 [Edge] Preparing to send email to ${email} via SMTP...`);

    // 6. SEND EMAIL VIA NODEMAILER (SMTP)
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465, // true for 465, false for other ports
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    // Test Point: Verify connection (ensures fail fast if creds are wrong)
    try {
        await new Promise((resolve, reject) => {
            transporter.verify(function (error, success) {
                if (error) {
                    console.error("❌ [Edge] SMTP Connection Verification Failed:", error);
                    reject(error);
                } else {
                    console.log("✅ [Edge] SMTP Server is ready");
                    resolve(success);
                }
            });
        });
    } catch (verifyError) {
        throw new Error(`Brevo SMTP Connection Failed: ${verifyError.message}`);
    }

    const mailOptions = {
        from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
        to: email,
        subject: 'You have been invited to join an Organization on Petrolord HSE',
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px;">
            <h1 style="color: #1a1a2e; margin-bottom: 16px;">Invitation to Join</h1>
            <p style="font-size: 16px; line-height: 1.5; margin-bottom: 24px;">
              You have been invited to join the organization on <strong>Petrolord HSE</strong> as a <strong>${inviteData.role}</strong>.
            </p>
            <div style="text-align: center; margin: 32px 0;">
                <a href="${inviteLink}" style="padding: 14px 28px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">Accept Invitation</a>
            </div>
            <p style="font-size: 14px; color: #666; text-align: center;">
              This link is valid for 7 days.
            </p>
          </div>
        `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ [Edge] Email sent successfully via SMTP. Message ID:", info.messageId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Invitation sent successfully via SMTP",
        invite: inviteData,
        messageId: info.messageId
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error("❌ [Edge] Handler Error:", error.message);
    
    // Provide detailed error info for debugging
    const errorMessage = error.message || "An unexpected error occurred processing the invite.";
    
    // 7. ERROR RESPONSE (400 Bad Request)
    return new Response(
      JSON.stringify({ 
          error: errorMessage,
          details: error.stack
      }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})