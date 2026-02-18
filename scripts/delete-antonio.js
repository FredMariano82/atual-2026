
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
    const idToDelete = "4b36cbfe-7ff8-4850-b956-99bf184f06c5";  // Retrieved from previous step

    const { error } = await supabase
        .from('prestadores')
        .delete()
        .eq('id', idToDelete);

    if (error) {
        console.error("Error deleting:", error);
    } else {
        console.log(`Deleted record with ID: ${idToDelete}`);
    }
}

run();
