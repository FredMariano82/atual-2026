const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    // Check columns and their nullability
    const { data: cols, error: currErr } = await supabase
        .rpc('get_columns', { table_name: 'solicitacoes' }); // RPC might not exist, using raw query if possible or just describing

    // We can't run RAW SQL easily with client unless we have a function. 
    // But we can try to insert a dummy and see the error.

    console.log("Tentando insert dummy para ver erro...");
    const { data, error } = await supabase
        .from('solicitacoes')
        .insert({
            numero: "TESTE-DEBUG-" + Date.now(),
            // usuario_id: "00000000-0000-0000-0000-000000000000", // Comentar para ver se é obrigatório
            tipo_solicitacao: "checagem_liberacao",
            solicitante: "Tester"
        })
        .select();

    if (error) {
        console.error("❌ Erro Insert:", error);
    } else {
        console.log("✅ Sucesso:", data);
        // Clean up
        await supabase.from('solicitacoes').delete().eq('id', data[0].id);
    }
}

inspect();
