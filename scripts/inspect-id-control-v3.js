// 🕵️ Script de Inspeção de Usuário ID Control (Versão 3 - API iDClass/CGI)
// Executar: node scripts/inspect-id-control-v3.js <TERMO_BUSCA>

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
        console.log("❌ Não foi possível obter sessão. Tentando método antigo de login...");
        return;
    }

    console.log(`✅ Sessão obtida: ${session}`);

    // Tentar carregar usuários via load_objects.fcgi (Padrão Control iD mais recente)
    // Entidade 'users'
    try {
        console.log(`🔍 Buscando usuários via load_objects.fcgi...`);
        const response = await fetch(`${ID_CONTROL_URL}/load_objects.fcgi?session=${session}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ object: "users" })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.users) {
                console.log(`📋 Total usuários encontrados: ${data.users.length}`);
                const termo = process.argv[2] || "Abilia";
                const alvo = data.users.find(u => JSON.stringify(u).toLowerCase().includes(termo.toLowerCase()));

                if (alvo) {
                    console.log("\n=============================================");
                    console.log(`📄 DADOS DE: ${alvo.name || "Usuário Encontrado"}`);
                    console.log("=============================================\n");
                    console.log(JSON.stringify(alvo, null, 2));
                } else {
                    console.log(`⚠️ Usuário "${termo}" não encontrado. Exibindo primeiro da lista:`);
                    if (data.users.length > 0) console.log(JSON.stringify(data.users[0], null, 2));
                }
            }
        } else {
            console.log(`❌ Erro no load_objects: ${response.status}`);
        }

    } catch (e) {
        console.error("❌ Erro na busca:", e.message);
    }
}

inspectUser();
