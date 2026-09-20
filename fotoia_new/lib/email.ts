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
