
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log("Inspecting 'usuarios' columns...");
    const { data: users, error } = await supabase
        .from('usuarios') // Check if table name is plural or singular? User said "usuarios"
        .select('*')
        .limit(1);

    if (error) {
        console.log("Error querying 'usuarios' (maybe 'users'? 'profiles'?):", error.message);
        // Fallback check
        const { data: profiles, error: pError } = await supabase.from('profiles').select('*').limit(1);
        if (!pError) console.log("Found 'profiles' table columns:", Object.keys(profiles[0] || {}));
    } else if (users && users.length > 0) {
        console.log("Users columns:", Object.keys(users[0]));
        console.log("Sample user:", JSON.stringify(users[0], null, 2));
    } else {
        console.log("'usuarios' table exists but is empty.");
        // We can't see keys if empty, try RPC or just assume if no error?
        // Let's try to query 'auth.users' via RPC if needed, but 'usuarios' implies public table.
    }
}

inspect();
