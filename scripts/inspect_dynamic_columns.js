
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectColumns() {
    console.log("Inspecting 'prestadores' columns...");
    const { data: prestadores, error: pError } = await supabase
        .from('prestadores')
        .select('*')
        .limit(1);

    if (pError) console.error("Error fetching prestadores:", pError);
    else if (prestadores.length > 0) console.log("Prestadores columns:", Object.keys(prestadores[0]));
    else console.log("Prestadores table is empty, cannot inspect keys dynamically.");

    console.log("\nInspecting 'solicitacoes' columns...");
    const { data: solicitacoes, error: sError } = await supabase
        .from('solicitacoes')
        .select('*')
        .limit(1);

    if (sError) console.error("Error fetching solicitacoes:", sError);
    else if (solicitacoes.length > 0) console.log("Solicitacoes columns:", Object.keys(solicitacoes[0]));
    else console.log("Solicitacoes table is empty, cannot inspect keys dynamically.");
}

inspectColumns();
