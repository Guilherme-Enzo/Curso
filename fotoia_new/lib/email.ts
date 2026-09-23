const EMAIL_FROM = process.env.EMAIL_FROM || "Retrato ImaginAdo <retratoimaginado@cgialabs.com.br>";

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY não configurada");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject: "Redefinição de senha | Retrato ImaginAdo",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b"><h2>Redefina sua senha</h2><p>Recebemos uma solicitação para alterar a senha da sua conta.</p><p><a href="${resetUrl}" style="display:inline-block;background:#8b5cf6;color:white;padding:12px 20px;border-radius:8px;text-decoration:none">Criar nova senha</a></p><p>Este link expira em 30 minutos. Se você não solicitou a alteração, ignore este e-mail.</p></div>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error ${response.status}: ${details}`);
  }
}

export async function sendEmailVerificationEmail(to: string, verificationUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY não configurada");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject: "Confirme seu e-mail | Retrato ImaginAdo",
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#18181b"><h2>Confirme seu e-mail</h2><p>Para ativar sua conta no Retrato ImaginAdo, confirme que este e-mail é seu.</p><p><a href="${verificationUrl}" style="display:inline-block;background:#8b5cf6;color:white;padding:12px 20px;border-radius:8px;text-decoration:none">Confirmar e-mail</a></p><p>Este link expira em 24 horas. Se você não criou esta conta, ignore este e-mail.</p></div>`,
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Resend error ${response.status}: ${details}`);
  }
}
