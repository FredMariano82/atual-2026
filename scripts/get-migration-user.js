const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function getUserId() {
    const uniqueId = Date.now();
    const email = `migracao_${uniqueId}@sistema.com`;
    const password = "migracao_password_123";

    console.log(`Tentando criar usuário único: ${email}...`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password
    });

    if (signUpError) {
        console.error("❌ Falha ao criar usuário:", signUpError.message);
        return;
    }

    if (signUpData && signUpData.user) {
        console.log("✅ ID DO USUÁRIO:", signUpData.user.id);
        fs.writeFileSync('migration_user_id.txt', signUpData.user.id);
    } else {
        console.error("❌ Usuário criado mas objeto user veio vazio (pode exigir confirmação de email).");
        // Se exigir confirmação, o ID ainda existe no objeto user?
        // Sim, geralmente vem.
        if (signUpData?.user?.id) {
            fs.writeFileSync('migration_user_id.txt', signUpData.user.id);
        }
    }
}

getUserId();
