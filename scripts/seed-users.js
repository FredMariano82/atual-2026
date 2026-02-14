
const { createClient } = require("@supabase/supabase-js");

// Usando a ANON KEY 
const supabaseUrl = "https://icsictpkalcuwotlatyb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc2ljdHBrYWxjdXdvdGxhdHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTM2NTUsImV4cCI6MjA4Mzc4OTY1NX0.9B51dPPBsLwM2yftx4KCkZCUWUTFfjqKWRHsr0PfPRk";

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Credenciais não encontradas.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const usuarios = [
    // --- Esportivo ---
    { nome: "Esportivo 1", email: "esportivo1@mvm.com", departamento: "Esportivo", perfil: "solicitante", senha: "123" },
    { nome: "Esportivo 2", email: "esportivo2@mvm.com", departamento: "Esportivo", perfil: "solicitante", senha: "123" },
    { nome: "Esportivo 3", email: "esportivo3@mvm.com", departamento: "Esportivo", perfil: "solicitante", senha: "123" },

    // --- Eventos ---
    { nome: "Eventos 1", email: "eventos1@mvm.com", departamento: "Eventos", perfil: "solicitante", senha: "123" },
    { nome: "Eventos 2", email: "eventos2@mvm.com", departamento: "Eventos", perfil: "solicitante", senha: "123" },
    { nome: "Eventos 3", email: "eventos3@mvm.com", departamento: "Eventos", perfil: "solicitante", senha: "123" },

    // --- Agenda ---
    { nome: "Agenda 1", email: "agenda1@mvm.com", departamento: "Agenda", perfil: "solicitante", senha: "123" },
    { nome: "Agenda 2", email: "agenda2@mvm.com", departamento: "Agenda", perfil: "solicitante", senha: "123" },
    { nome: "Agenda 3", email: "agenda3@mvm.com", departamento: "Agenda", perfil: "solicitante", senha: "123" },

    // --- Social ---
    { nome: "Social 1", email: "social1@mvm.com", departamento: "Social", perfil: "solicitante", senha: "123" },
    { nome: "Social 2", email: "social2@mvm.com", departamento: "Social", perfil: "solicitante", senha: "123" },
    { nome: "Social 3", email: "social3@mvm.com", departamento: "Social", perfil: "solicitante", senha: "123" },

    // --- Patrimônio ---
    { nome: "Patrimônio 1", email: "patrimonio1@mvm.com", departamento: "Patrimônio", perfil: "solicitante", senha: "123" },
    { nome: "Patrimônio 2", email: "patrimonio2@mvm.com", departamento: "Patrimônio", perfil: "solicitante", senha: "123" },
    { nome: "Patrimônio 3", email: "patrimonio3@mvm.com", departamento: "Patrimônio", perfil: "solicitante", senha: "123" },

    // --- Perfis Administrativos (Migrados para MVM) ---
    { nome: "Aprovador 1", email: "aprovador1@mvm.com", departamento: "Diretoria", perfil: "aprovador", senha: "123" },
    { nome: "Aprovador 2", email: "aprovador2@mvm.com", departamento: "Financeiro", perfil: "aprovador", senha: "123" },

    { nome: "Admin 1", email: "admin1@mvm.com", departamento: "TI", perfil: "administrador", senha: "123" },
    { nome: "Gestor 1", email: "gestor1@mvm.com", departamento: "Financeiro", perfil: "gestor", senha: "123" },
    { nome: "Recepção 1", email: "recepcao1@mvm.com", departamento: "Recepção", perfil: "recepcao", senha: "123" },
    { nome: "Suporte 1", email: "suporte1@mvm.com", departamento: "TI", perfil: "suporte", senha: "123" },
    { nome: "SuperAdmin", email: "superadmin@mvm.com", departamento: "Diretoria", perfil: "superadmin", senha: "123" }
];

async function seedUsers() {
    console.log("🌱 Iniciando processo de migração de usuários para @mvm.com...");

    // 1. Limpar usuários antigos (@hebraica.com.br)
    console.log("🧹 Removendo usuários antigos (@hebraica.com.br)...");
    const { error: deleteError, count } = await supabase
        .from("usuarios")
        .delete({ count: 'exact' })
        .like("email", "%@hebraica.com.br");

    if (deleteError) {
        console.error("❌ Erro ao limpar usuários antigos:", deleteError.message);
    } else {
        console.log(`✅ Usuários antigos removidos.`);
        // Nota: count pode ser null dependendo das permissões, mas o comando é executado.
    }

    // 2. Criar novos usuários (@mvm.com)
    let criados = 0;
    let existiam = 0;

    for (const user of usuarios) {
        // Check if user exists
        const { data: existingUser, error: fetchError } = await supabase
            .from("usuarios")
            .select("id")
            .eq("email", user.email)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            console.error(`❌ Erro ao verificar usuário ${user.email}:`, fetchError.message);
            continue;
        }

        if (existingUser) {
            console.log(`⚠️ Usuário ${user.email} já existe. Pulando.`);
            existiam++;
        } else {
            // Create user
            const { error: insertError } = await supabase
                .from("usuarios")
                .insert([user]);

            if (insertError) {
                console.error(`❌ Erro ao criar usuário ${user.email}:`, insertError.message);
            } else {
                console.log(`✅ Usuário ${user.email} criado com sucesso!`);
                criados++;
            }
        }
    }
    console.log(`🏁 Processo finalizado. ${criados} usuários criados, ${existiam} já existiam.`);
}

seedUsers();
