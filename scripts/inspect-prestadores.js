
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspect() {
    console.log("🔍 Buscando últimos prestadores...");
    const { data, error } = await supabase
        .from('prestadores')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("❌ Erro:", error);
        return;
    }

    const fs = require('fs');
    fs.writeFileSync('inspect_result.txt', JSON.stringify(data.map(p => ({
        nome: p.nome,
        doc: p.documento,
        empresa: p.empresa,
        status: p.status
    })), null, 2));
    console.log("✅ Resultado salvo em inspect_result.txt");
}

inspect();
