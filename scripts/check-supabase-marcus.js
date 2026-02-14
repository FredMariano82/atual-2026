
// Script para ler dados do Marcus no Supabase
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("🔍 Buscando Marcus (10023166) no Supabase...");

    // Buscar pelo ID Control ou pelo nome
    const { data: p, error } = await supabase
        .from('prestadores')
        .select(`
            id, nome, documento, status, empresa, checagem_valida_ate,
            id_control_id, integrado_id_control,
            solicitacoes ( data_inicial, data_final )
        `)
        .eq('id_control_id', 10023166)
        .single();

    if (error) return console.error("Erro Supabase:", error);

    if (p) {
        console.log("\n========================================");
        console.log(`Nome:      ${p.nome}`);
        console.log(`Validade:  ${p.checagem_valida_ate}`);
        if (p.solicitacoes) {
            const sol = Array.isArray(p.solicitacoes) ? p.solicitacoes[0] : p.solicitacoes;
            console.log(`Data Ini:  ${sol?.data_inicial}`);
            console.log(`Data Fim:  ${sol?.data_final}`);
        }
        console.log("========================================");
    } else {
        console.log("Prestador não encontrado.");
    }
}

run();
