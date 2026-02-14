
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log("🔍 Buscando prestadores Hebraica aprovados...");
    const { data, error } = await supabase
        .from('prestadores')
        .select('id, nome, documento, empresa, status')
        .eq('status', 'aprovado')
        .eq('empresa', 'Hebraica')
        .limit(5);

    if (error) {
        console.error("❌ Erro:", error);
        return;
    }

    if (data.length === 0) {
        console.log("💤 Nenhum encontrado.");
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}

inspect();
