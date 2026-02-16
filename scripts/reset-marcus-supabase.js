
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function resetMarcus() {
    console.log("🔄 Resetando status de integração do Marcus no Supabase...");

    // ID do Marcus no Supabase: 2957570d-6702-4223-a4d5-720055edf95e
    // Mas vamos buscar por nome para ser genérico caso mude
    const { data: users, error: searchError } = await supabase
        .from('prestadores')
        .select('id')
        .ilike('nome', '%Marcus Marcus Marcus%');

    if (searchError || !users.length) {
        console.error("❌ Erro ao achar Marcus:", searchError?.message || "Não encontrado");
        return;
    }

    const idSupabase = users[0].id;
    console.log(`   ID Supabase encontrado: ${idSupabase}`);

    const { error } = await supabase
        .from('prestadores')
        .update({
            integrado_id_control: false,
            id_control_id: null,
            data_integracao: null
        })
        .eq('id', idSupabase);

    if (error) {
        console.error("❌ Erro ao resetar:", error.message);
    } else {
        console.log("✅ Sucesso! Marcus está pronto para ser reintegrado.");
    }
}

resetMarcus();
