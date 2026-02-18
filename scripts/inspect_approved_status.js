
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log("Searching for 'aprovado' or 'aprovada' created/updated recently...");

    // Check both options
    const { data: approvedData, error: aprError } = await supabase
        .from('prestadores')
        .select('*')
        .or('status.eq.aprovado,status.eq.aprovada')
        .order('updated_at', { ascending: false })
        .limit(5);

    if (aprError) {
        console.error("Error fetching approved:", aprError);
    } else {
        console.log("Found Approved Records (Last 5):");
        approvedData.forEach(p => {
            console.log(`- ID: ${p.id}, Nome: ${p.nome}, RG: ${p.documento}, Status: '${p.status}', Updated: ${p.updated_at}`);
        });
    }

    // Also check pending just in case
    const { data: pendingData, error: pendError } = await supabase
        .from('prestadores')
        .select('*')
        .eq('status', 'pendente')
        .order('updated_at', { ascending: false })
        .limit(3);

    if (pendError) {
        console.error("Error fetching pending:", pendError);
    } else {
        console.log("\nFound Pending Records (Last 3):"); // Just to see if user is confused
        pendingData.forEach(p => {
            console.log(`- ID: ${p.id}, Nome: ${p.nome}, RG: ${p.documento}, Status: '${p.status}', Updated: ${p.updated_at}`);
        });
    }
}

inspect();
