
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Forcing 'cadastro' (Liberação) update for RG 56996 to 'negada'...");

    // Find the 'reprovado' record
    const { data: records } = await supabase
        .from('prestadores')
        .select('id, status, observacoes')
        .eq('documento', '56996')
        .eq('status', 'reprovado');

    if (!records || records.length === 0) {
        console.log("No 'reprovado' record found for 56996.");
        return;
    }

    const rec = records[records.length - 1];
    console.log(`Updating ID: ${rec.id}...`);

    const { error } = await supabase
        .from('prestadores')
        .update({
            cadastro: 'negada' // Atualizando Liberação
        })
        .eq('id', rec.id);

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("✅ Successfully updated 'cadastro' to 'negada'.");
    }
}
run();
