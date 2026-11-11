// =====================================================================
// MATCHLY — envio de avisos por e-mail e SMS.
// Fica desligado até você colocar as chaves na Vercel (Settings → Environment Variables):
//
//   E-mail (um dos dois):
//     BREVO_API_KEY   + EMAIL_REMETENTE   (brevo.com, plano grátis: 300 e-mails por dia)
//     RESEND_API_KEY  + EMAIL_REMETENTE   (resend.com, plano grátis: 3.000 por mês; exige domínio próprio)
//     EMAIL_REMETENTE no formato:  Matchly <seuemail@dominio.com>
//
//   SMS (pago por mensagem):
//     TWILIO_ACCOUNT_SID + TWILIO_AUTH_TOKEN + TWILIO_FROM   (twilio.com; TWILIO_FROM é o número +1... ou +55...)
// =====================================================================

const env = process.env;
export const canais = () => ({
  email: !!((env.BREVO_API_KEY || env.RESEND_API_KEY) && env.EMAIL_REMETENTE),
  sms: !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM),
});

const remetente = () => {
  const m = String(env.EMAIL_REMETENTE || "").match(/^\s*(.*?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1] || "Matchly", email: m[2] } : { name: "Matchly", email: String(env.EMAIL_REMETENTE || "").trim() };
};
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// e-mail simples, legível no celular, com o botão principal e o link para mudar os avisos
export function modeloEmail({ titulo, texto, botao, link, site }) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;background:#f6f4f3;font-family:Arial,Helvetica,sans-serif;color:#12161F">
<div style="max-width:520px;margin:0 auto;padding:24px 16px">
  <div style="font-size:22px;font-weight:bold;margin-bottom:16px">Match<span style="color:#7A1B2E">ly</span></div>
  <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #E7E3E0">
    <h1 style="font-size:20px;margin:0 0 12px">${esc(titulo)}</h1>
    <div style="font-size:15px;line-height:1.6">${texto}</div>
    ${botao ? `<p style="margin:22px 0 0"><a href="${esc(link)}" style="background:#7A1B2E;color:#fff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:bold">${esc(botao)}</a></p>` : ""}
  </div>
  <p style="font-size:12px;color:#6b7078;margin-top:16px;line-height:1.5">Você recebe este aviso porque se cadastrou no Matchly. Nenhuma vaga séria cobra dinheiro de você.<br>
  <a href="${esc(site)}/#avisos" style="color:#7A1B2E">Mudar ou desligar os avisos</a></p>
</div></body></html>`;
}

export async function enviarEmail(para, assunto, html) {
  if (!para || !/^\S+@\S+\.\S+$/.test(para) || !canais().email) return false;
  try {
    if (env.BREVO_API_KEY) {
      const r = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST", headers: { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify({ sender: remetente(), to: [{ email: para }], subject: assunto, htmlContent: html }),
      });
      return r.ok;
    }
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_REMETENTE, to: para, subject: assunto, html }),
    });
    return r.ok;
  } catch { return false; }
}

// celular brasileiro → formato internacional (+55 DDD número)
export const telefoneE164 = (t) => {
  const d = String(t || "").replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) return "+55" + d;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) return "+" + d;
  return null;
};

export async function enviarSMS(telefone, texto) {
  const para = telefoneE164(telefone);
  if (!para || !canais().sms) return false;
  try {
    const corpo = new URLSearchParams({ To: para, From: env.TWILIO_FROM, Body: texto.slice(0, 300) });
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: { Authorization: "Basic " + Buffer.from(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
      body: corpo,
    });
    return r.ok;
  } catch { return false; }
}
