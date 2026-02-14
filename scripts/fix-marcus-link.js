
// Script para corrigir o vínculo do Marcus manualmente
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const MARCUS_ID_CONTROL = 10023166; // O ID que achamos na lista
const MARCUS_RG = "123456";

async function run() {
    console.log(`🔗 Vinculando 'Marcus' (RG ${MARCUS_RG}) ao ID Control ${MARCUS_ID_CONTROL}...`);

    const { data: prestador, error: errGet } = await supabase
        .from('prestadores')
        .select('id, nome')
        .eq('empresa', 'Hebraica') // Garantir que é da Hebraica
        .ilike('nome', '%Marcus%') // Achar pelo nome aprox
        .single(); // Esperamos só um

    if (errGet || !prestador) {
        console.error("❌ Erro ao achar Marcus no Supabase:", errGet);
        return;
    }

    console.log(`   Prestador encontrado: ${prestador.nome} (ID ${prestador.id})`);

    const { error: errUpdate } = await supabase
        .from('prestadores')
        .update({
            id_control_id: MARCUS_ID_CONTROL,
            integrado_id_control: true,
            data_integracao: new Date()
        })
        .eq('id', prestador.id);

    if (errUpdate) {
        console.error("❌ Erro ao atualizar Supabase:", errUpdate);
    } else {
        console.log("✅ VÍNCULO SALVO COM SUCESSO!");
        console.log("   Agora o sync deve funcionar sem tentar criar duplicado.");
    }
}

run();
