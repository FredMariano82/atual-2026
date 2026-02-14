// 🕵️ Script de Inspeção de Usuário ID Control
// Executar: node scripts/inspect-id-control-user.js <RG_OU_ID>

require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function loginIdControl() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log(`🔐 Logando em ${ID_CONTROL_URL}...`);
    try {
        const response = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        if (!response.ok) throw new Error(`Status ${response.status} - ${await response.text()}`);
        const data = await response.json();
        return data.accessToken || data.token;
    } catch (e) {
        console.error("❌ Erro login:", e.message);
        return null;
    }
}

async function inspectUser() {
    const token = await loginIdControl();
    if (!token) return;

    // Pegar argumento da linha de comando (RG ou nada)
    const busca = process.argv[2];
    let url = `${ID_CONTROL_URL}/api/users`;

    // Se tiver argumento, tenta filtrar (assumindo que api suporta filtro ou vamos pegar o primeiro)
    // Nota: A API exata de busca depende da documentação do ID Control, vamos tentar listar todos e pegar um exemplo
    // ou buscar por query se soubermos o parâmetro.

    console.log(`🔍 Buscando usuários no ID Control...`);

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error(`Erro API: ${response.status}`);

        const data = await response.json();

        // Se passar um RG/Doc, tenta filtrar na mão se a API retornou tudo
        let alvo = null;
        if (Array.isArray(data)) {
            console.log(`📋 Total de usuários retornados: ${data.length}`);
            if (busca) {
                console.log(`🔎 Filtrando por: ${busca}`);
                // Tenta encontrar algo que pareça com o RG ou Nome
                alvo = data.find(u => JSON.stringify(u).includes(busca));
            } else {
                // Pega o primeiro como exemplo
                console.log(`⚠️ Nenhum termo de busca fornecido. Pegando o primeiro usuário encontrado como exemplo.`);
                alvo = data[0];
            }
        } else if (data.id || data.name) {
            // Retornou um objeto único
            alvo = data;
        }

        if (alvo) {
            console.log("\n=============================================");
            console.log("📄 ESTRUTURA DO USUÁRIO NO ID CONTROL");
            console.log("=============================================\n");
            console.log(JSON.stringify(alvo, null, 2));
            console.log("\n=============================================");
            console.log("👆 Analise os campos acima para o mapeamento.");
        } else {
            console.log("❌ Nenhum usuário encontrado para inspeção.");
        }

    } catch (e) {
        console.error("❌ Erro ao buscar usuários:", e.message);
    }
}

inspectUser();
