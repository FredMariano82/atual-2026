
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    console.log("Forcing status update for Antonio Luiz (RG 56996)...");

    // Find the record that is presently 'aprovado' (the one user sees)
    const { data: records } = await supabase
        .from('prestadores')
        .select('id, nome, status')
        .eq('documento', '56996')
        .eq('status', 'aprovado'); // Specifically target the stale one

    if (!records || records.length === 0) {
        console.log("No 'aprovado' record found for 56996. Checking 'erro_rg'...");
        // Check if it's already updated
        const { data: already } = await supabase
            .from('prestadores')
            .select('*')
            .eq('documento', '56996');
        console.log("Current records:", JSON.stringify(already, null, 2));
        return;
    }

    const id = records[records.length - 1].id; // Take the last one (probably newest)
    console.log(`Updating ID: ${id} from 'aprovado' to 'erro_rg'...`);

    const { error } = await supabase
        .from('prestadores')
        .update({
            status: 'erro_rg',
            observacoes: 'Erro Sync (Manual Fix): RG já cadastrado no ID Control. Verifique duplicidade.'
        })
        .eq('id', id);

    if (error) {
        console.error("Error updating:", error);
    } else {
        console.log("✅ Successfully updated status to 'erro_rg'.");
    }
}
run();
