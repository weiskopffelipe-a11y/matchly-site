// MATCHLY — chamado uma vez por dia pelo agendador da Vercel (vercel.json → crons).
// Manda por e-mail/SMS as vagas novas que combinam com cada pessoa.
import handler from "./app.js";
export default function resumo(req, res) {
  req.query = { ...(req.query || {}), acao: "resumo_diario" };
  return handler(req, res);
}
