import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// O banco pode ter sido ligado de dois jeitos: pelas variáveis VITE_* (manual)
// ou pela integração Supabase da Vercel (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY...).
// Se a API tiver o endereço e a chave secreta, o site entra em modo "ao vivo".
const tem = (...nomes) => nomes.some((n) => !!process.env[n]);
if (!process.env.VITE_AO_VIVO && tem("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "VITE_SUPABASE_URL")
  && tem("SUPABASE_SERVICE_KEY", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_SECRET_KEY")) {
  process.env.VITE_AO_VIVO = "1";
}

export default defineConfig({ plugins: [react()] });
