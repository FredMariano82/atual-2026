
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    console.log("Checking status column...");

    // Try to update with a non-standard status on a non-existent ID to see if it fails validation
    // efficiently
    const { error } = await supabase
        .from('prestadores')
        .update({ status: 'teste_status_check' })
        .eq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
        console.log("Error updating status:", error.message);
        // If it says "invalid input value for enum...", we know it's an enum.
    } else {
        console.log("Update processed (no error on value). Likely text or enum includes it.");
    }
}

check();
