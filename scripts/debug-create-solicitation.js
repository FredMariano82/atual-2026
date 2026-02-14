require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function obterSolicitacaoMigracao() {
    const NUMERO_MIGRACAO = "2024-MIGRACAO";

    console.log("🔍 Buscando solicitação...");
    const { data: existente, error: findError } = await supabase
        .from('solicitacoes')
        .select('id')
        .eq('numero', NUMERO_MIGRACAO)
        .maybeSingle();

    if (findError) {
        console.error("❌ Erro ao buscar:", findError);
        return;
    }

    if (existente) {
        console.log("✅ Já existe:", existente.id);
        return existente.id;
    }

    console.log("🆕 Criando Solicitação de Migração (Container)...");
    const { data: nova, error } = await supabase
        .from('solicitacoes')
        .insert({
            numero: NUMERO_MIGRACAO,
            solicitante: "ID Control Import",
            departamento: "TI / Segurança",
            usuario_id: "8396be86-80a3-42eb-867c-ef14a2461039",
            tipo_solicitacao: "checagem_liberacao",
            finalidade: "evento",
            local: "Importação de Sistema Legado",
            empresa: "Migração ID Control",
            status_geral: "aprovado",
            data_inicial: new Date().toISOString(),
            data_final: new Date(new Date().setFullYear(new Date().getFullYear() + 50)).toISOString(),
            data_solicitacao: new Date().toISOString(),
            hora_solicitacao: "00:00"
        })
        .select('id')
        .single();

    if (error) {
        console.error("❌ Erro ao criar:", error);
    } else {
        console.log("✅ SUCESSO! ID:", nova.id);
    }
}

obterSolicitacaoMigracao();
