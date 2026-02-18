
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Forcing status update for Antonio Luiz (RG 56996) to 'reprovado'...");

    // Find 'aprovado'
    const { data: records } = await supabase
        .from('prestadores')
        .select('id')
        .eq('documento', '56996')
        .eq('status', 'aprovado');

    if (!records || records.length === 0) {
        console.log("No stale record found. Maybe it's already updated?");
        return;
    }

    const id = records[records.length - 1].id;
    console.log(`Updating ID: ${id}...`);

    const { error } = await supabase
        .from('prestadores')
        .update({
            status: 'reprovado', // ALLOWED STATUS
            observacoes: '[ERRO RG] Erro Sync: RG já cadastrado no ID Control. Verifique duplicidade.'
        })
        .eq('id', id);

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("✅ Successfully updated status to 'reprovado' + [ERRO RG].");
    }
}
run();
