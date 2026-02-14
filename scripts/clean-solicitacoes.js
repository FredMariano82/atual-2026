
const { createClient } = require("@supabase/supabase-js");

// Usando a ANON KEY (que funcionou nos scripts anteriores)
const supabaseUrl = "https://icsictpkalcuwotlatyb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc2ljdHBrYWxjdXdvdGxhdHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTM2NTUsImV4cCI6MjA4Mzc4OTY1NX0.9B51dPPBsLwM2yftx4KCkZCUWUTFfjqKWRHsr0PfPRk";

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Credenciais não encontradas.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanSolicitacoes() {
    console.log("🧹 Iniciando limpeza de solicitações e prestadores...");

    // 1. Delete all Prestadores
    const { error: errorPrestadores } = await supabase
        .from("prestadores")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (errorPrestadores) {
        console.error("❌ Erro ao limpar prestadores:", errorPrestadores.message);
    } else {
        console.log("✅ Tabela 'prestadores' limpa com sucesso.");
    }

    // 2. Delete all Solicitacoes
    const { error: errorSolicitacoes } = await supabase
        .from("solicitacoes")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

    if (errorSolicitacoes) {
        console.error("❌ Erro ao limpar solicitações:", errorSolicitacoes.message);
    } else {
        console.log("✅ Tabela 'solicitacoes' limpa com sucesso.");
    }

    console.log("🏁 Limpeza concluída! Usuários foram mantidos.");
}

cleanSolicitacoes();
