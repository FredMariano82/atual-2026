const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function createProfile() {
    let userId;
    try {
        userId = fs.readFileSync('migration_user_id.txt', 'utf8').trim();
    } catch (e) {
        console.error("❌ Não achei migration_user_id.txt");
        return;
    }

    console.log("👤 Criando perfil para ID:", userId);

    // Tentar criar perfil
    const { error } = await supabase.from('usuarios').upsert({
        id: userId, // PK?
        nome: "Sistema de Migração",
        email: `migracao_${userId.substring(0, 8)}@sistema.com`, // Email fake ou pegar do auth se possível, mas aqui basta ser único
        perfil: "administrador",
        departamento: "TI"
    });

    if (error) {
        console.error("❌ Erro ao criar perfil:", error);
    } else {
        console.log("✅ Perfil criado/atualizado com sucesso!");
    }
}

createProfile();
