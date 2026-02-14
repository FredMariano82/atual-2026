
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
    console.log("Checking schema for 'solicitacoes' and 'prestadores'...");

    // We can't query information_schema directly via supabase-js client usually unless we have a function or direct SQL access.
    // But we can try to inspect the response of a select * limit 1 to see the keys.

    try {
        const { data: solicitacoes, error: errSol } = await supabase.from('solicitacoes').select('*').limit(1);
        if (errSol) {
            console.error("Error fetching solicitacoes:", errSol);
        } else if (solicitacoes.length > 0) {
            console.log("Table 'solicitacoes' columns:", Object.keys(solicitacoes[0]));
        } else {
            // If table is empty, we can't see columns this way.
            // Try to insert a dummy (and fail) or similar? No, too risky.
            // Let's assume there is data.
            console.log("Table 'solicitacoes' is empty or no data returned.");
        }

        const { data: prestadores, error: errPrest } = await supabase.from('prestadores').select('*').limit(1);
        if (errPrest) {
            console.error("Error fetching prestadores:", errPrest);
        } else if (prestadores.length > 0) {
            console.log("Table 'prestadores' columns:", Object.keys(prestadores[0]));
        } else {
            console.log("Table 'prestadores' is empty or no data returned.");
        }

    } catch (e) {
        console.error("Exception:", e);
    }
}

checkSchema();
