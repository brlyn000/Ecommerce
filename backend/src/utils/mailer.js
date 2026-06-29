const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendResetPasswordEmail = async (toEmail, resetUrl) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"EkrafMarket" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: 'Reset Password - EkrafMarket',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">EkrafMarket</h1>
        </div>
        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827; margin-top: 0;">Reset Password</h2>
          <p style="color: #6b7280;">Kami menerima permintaan reset password untuk akun kamu. Klik tombol di bawah untuk membuat password baru.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc2626; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">Link ini akan kadaluarsa dalam <strong>1 jam</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">Jika kamu tidak meminta reset password, abaikan email ini.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Atau copy link ini ke browser:<br>
            <a href="${resetUrl}" style="color: #dc2626; word-break: break-all;">${resetUrl}</a>
          </p>
        </div>
      </div>
    `,
  });
};

module.exports = { sendResetPasswordEmail };
