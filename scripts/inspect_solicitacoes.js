
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    const { data, error } = await supabase
        .from('solicitacoes')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else if (data && data.length > 0) {
        console.log("Solicitacoes keys:", Object.keys(data[0]));
    } else {
        console.log("Solicitacoes table empty or no access.");
    }
}

inspect();
