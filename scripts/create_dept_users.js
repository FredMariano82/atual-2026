const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const deptoNomes = [
    'Patrimônio',
    'Esportivo',
    'Cultural',
    'Concessões',
    'Agenda',
    'Eventos'
];

async function createAll() {
    console.log('🚀 Iniciando processo de criação...');

    for (const nome of deptoNomes) {
        console.log(`\n🏢 Processando departamento: ${nome}`);

        // 1. Verificar se o depto já existe ou criar
        let { data: depto, error: deptoError } = await supabase
            .from('departamentos')
            .select('id')
            .eq('nome', nome)
            .single();

        if (deptoError && deptoError.code !== 'PGRST116') {
            console.error(`❌ Erro ao buscar depto ${nome}:`, deptoError);
            continue;
        }

        if (!depto) {
            console.log(`🆕 Criando departamento: ${nome}`);
            const { data: newDepto, error: createDeptoError } = await supabase
                .from('departamentos')
                .insert([{ nome }])
                .select()
                .single();

            if (createDeptoError) {
                console.error(`❌ Erro ao criar depto ${nome}:`, createDeptoError);
                continue;
            }
            depto = newDepto;
        }

        // 2. Criar os 3 usuários para este depto
        const usersToCreate = [];
        for (let i = 1; i <= 3; i++) {
            const num = i.toString().padStart(2, '0');
            const userName = `${nome} ${num}`;

            // Verificar se usuário já existe
            const { data: existingUser } = await supabase
                .from('usuarios')
                .select('id')
                .eq('email', userName)
                .single();

            if (!existingUser) {
                usersToCreate.push({
                    nome: userName,
                    email: userName,
                    senha: '123456',
                    departamento: nome,
                    departamento_id: depto.id,
                    perfil: 'solicitante'
                });
            }
        }

        if (usersToCreate.length > 0) {
            console.log(`👤 Criando ${usersToCreate.length} usuários para ${nome}...`);
            const { error: userError } = await supabase
                .from('usuarios')
                .insert(usersToCreate);

            if (userError) {
                console.error(`❌ Erro ao criar usuários para ${nome}:`, userError);
            } else {
                console.log(`✅ Usuários de ${nome} criados com sucesso!`);
            }
        } else {
            console.log(`ℹ️ Usuários para ${nome} já existem.`);
        }
    }

    console.log('\n✨ Processo finalizado!');
}

createAll();
