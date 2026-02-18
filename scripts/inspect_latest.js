
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log("Checking the absolute latest updated record...");
    const { data, error } = await supabase
        .from('prestadores')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

    if (error) {
        console.error("Error:", error);
    } else {
        if (data.length > 0) {
            const p = data[0];
            console.log("Latest Record:");
            console.log(`- Nome: ${p.nome}`);
            console.log(`- Documento: ${p.documento}`);
            console.log(`- Status: '${p.status}'`);
            console.log(`- Cadastro: '${p.cadastro}'`); // Maybe user meant 'cadastro' ok?
            console.log(`- Empresa: '${p.empresa}'`);
            console.log(`- Updated At: ${p.updated_at}`);
        } else {
            console.log("No records found.");
        }
    }
}

inspect();
