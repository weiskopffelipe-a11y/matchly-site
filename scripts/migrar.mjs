// =====================================================================
// MATCHLY — atualiza o banco sozinho a cada publicação na Vercel.
// Roda o supabase.sql (que pode rodar quantas vezes for preciso).
// Se o banco ainda não estiver ligado, só avisa e deixa o site publicar.
// =====================================================================
import fs from "node:fs";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL || process.env.DATABASE_URL || "";
if (!url) { console.log("[banco] Nenhum banco ligado ainda: pulando a atualização."); process.exit(0); }

let pg;
try { pg = (await import("pg")).default; } catch { console.log("[banco] Pacote pg não instalado: pulando."); process.exit(0); }

// o Supabase usa certificado próprio: a conexão continua criptografada, só não confere a cadeia
const endereco = url.replace(/([?&])sslmode=[^&]*(&|$)/, "$1").replace(/[?&]$/, "");
const cliente = new pg.Client({ connectionString: endereco, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 15000 });
const sql = fs.readFileSync(new URL("../supabase.sql", import.meta.url), "utf8");

try {
  await cliente.connect();
  await cliente.query(sql);
  const { rows } = await cliente.query("select count(*)::int as n from information_schema.tables where table_schema = 'public' and table_name in ('empresas','vagas','candidatos','candidaturas')");
  console.log(`[banco] Atualizado. Tabelas principais: ${rows[0].n}/4.`);
} catch (e) {
  console.warn("[banco] Não foi possível atualizar o banco agora:", e.message);
} finally {
  await cliente.end().catch(() => {});
}
