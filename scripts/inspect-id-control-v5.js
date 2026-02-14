// 🕵️ Script de Inspeção de Usuário ID Control (Versão 5 - Busca por ID Direto)
// Executar: node scripts/inspect-id-control-v5.js <ID_USUARIO>

require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function loginIdControl() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log(`🔐 Logando em ${ID_CONTROL_URL}...`);
    try {
        const response = await fetch(`${ID_CONTROL_URL}/login.fcgi`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ login: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });

        if (!response.ok) {
            console.log(`❌ Falha no login.fcgi: ${response.status}`);
            return null;
        }

        const data = await response.json();
        return data.session;
    } catch (e) {
        console.error("❌ Erro login:", e.message);
        return null;
    }
}

async function inspectUser() {
    const session = await loginIdControl();

    if (!session) {
        console.log("❌ Sessão não obtida.");
        return;
    }

    const usuarioId = process.argv[2];
    if (!usuarioId) {
        console.error("❌ Erro: Forneça o ID do usuário como argumento.");
        return;
    }

    console.log(`✅ Sessão: ${session.substring(0, 10)}...`);
    console.log(`🔍 Buscando usuário ID: ${usuarioId} via load_objects.fcgi...`);

    // Tentar carregar objeto específico pelo ID (where clause)
    try {
        const payload = {
            object: "users",
            where: {
                users: { id: usuarioId }
            }
        };

        const response = await fetch(`${ID_CONTROL_URL}/load_objects.fcgi?session=${session}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const data = await response.json();
            if (data.users && data.users.length > 0) {
                console.log("\n=============================================");
                console.log(`📄 DADOS COMPLETOS DE: ${data.users[0].name}`);
                console.log("=============================================\n");
                console.log(JSON.stringify(data.users[0], null, 2));

                // Tentar buscar grupos ou outras infos relacionadas se necessário
                // mas primeiro vamos focar no usuário
            } else {
                console.log(`⚠️ Usuário ID ${usuarioId} não encontrado (array vazio).`);
                console.log("Resposta bruta:", JSON.stringify(data));
            }
        } else {
            console.log(`❌ Erro no load_objects: ${response.status}`);
        }

    } catch (e) {
        console.error("❌ Erro na busca:", e.message);
    }
}

inspectUser();
