
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    // Insert a dummy to see return types, or just try to select
    // Actually, inspecting via an error message or just inserting one is easiest
    console.log("Checking row sample...");
    const { data, error } = await supabase
        .from('departamentos')
        .select('*')
        .limit(1);

    if (data && data.length > 0) {
        console.log("Sample:", data[0]);
    } else {
        console.log("Table empty.");
    }
}

inspect();
