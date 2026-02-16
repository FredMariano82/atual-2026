
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkSync() {
    console.log("📊 Verificando Status de Sincronia (Últimos 10)...");

    // Buscar Prestadores recentes (ID desc)
    const { data: prestadores, error } = await supabase
        .from('prestadores')
        .select(`
            id, nome, documento, status,
            integrado_id_control, id_control_id, data_integracao
        `)
        .eq('status', 'aprovado') // Filtra só os aprovados
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("❌ Erro Supabase:", error.message);
        return;
    }

    if (!prestadores || prestadores.length === 0) {
        console.log("⚠️ Nenhum registro encontrado.");
        return;
    }

    prestadores.forEach(p => {
        const icon = p.integrado_id_control ? "✅" : "⏳";
        console.log(`${icon} ${p.nome.padEnd(30)} | ID Ctrl: ${p.id_control_id || '---'} | Data: ${p.data_integracao || 'Pendente'}`);
    });
}

checkSync();
