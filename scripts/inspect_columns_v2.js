
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
    else if (prestadores && prestadores.length > 0) {
        console.log("Prestadores KEYS:", JSON.stringify(Object.keys(prestadores[0])));
        console.log("Sample Row:", JSON.stringify(prestadores[0], null, 2));
    } else {
        console.log("Prestadores table is empty.");
    }

    console.log("\nInspecting 'departamentos' table (if exists)...");
    const { data: deptos, error: dError } = await supabase
        .from('departamentos')
        .select('*')
        .limit(1);

    if (dError) console.log("Departamentos table check failed (might not exist):", dError.message);
    else console.log("Departamentos columns:", JSON.stringify(Object.keys(deptos[0] || {})));
}

inspectColumns();
