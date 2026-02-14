// 🕵️ Script de Inspeção de Usuário ID Control (Versão 2 - Busca por ID ou Listagem Geral)
// Executar: node scripts/inspect-id-control-v2.js <TERMO_BUSCA>

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
        return data.accessToken || data.token; // Ajustar conforme retorno real
    } catch (e) {
        console.error("❌ Erro login:", e.message);
        return null;
    }
}

async function inspectUser() {
    const token = await loginIdControl();
    if (!token) return;

    // Tentar endpoint de lista geral primeiro para ver estrutura
    // Se /api/users falhou com 404, pode ser /api/users/list ou similar. 
    // Vamos tentar endpoints comuns do ID Control (Almitec/Control iD)

    const endpoints = [
        "/api/users",
        "/api/users/list",
        "/api/user/list",
        "/api/usuarios",
        "/api/usuarios/listar"
    ];

    console.log(`🔍 Tentando descobrir endpoint de listagem de usuários...`);

    for (const endpoint of endpoints) {
        try {
            console.log(`   Tentando: ${endpoint}`);
            const response = await fetch(`${ID_CONTROL_URL}${endpoint}`, {
                method: "POST", // Muitas APIs da Control iD usam POST para listagem
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({}) // Body vazio para listar tudo
            });

            if (response.ok) {
                console.log(`   ✅ Sucesso no endpoint: ${endpoint}`);
                const data = await response.json();

                // Exibir estrutura do retorno
                console.log(`   📦 Retorno (tipo): ${Array.isArray(data) ? "Array" : typeof data}`);
                if (data.users || data.usuarios) {
                    const lista = data.users || data.usuarios;
                    console.log(`   📋 Total encontrados: ${lista.length}`);

                    // Procurar "Abilia"
                    const termo = process.argv[2] || "Abilia";
                    console.log(`   🔎 Buscando por: "${termo}" na lista...`);

                    const alvo = lista.find(u => JSON.stringify(u).toLowerCase().includes(termo.toLowerCase()));

                    if (alvo) {
                        console.log("\n=============================================");
                        console.log(`📄 DADOS DE: ${alvo.name || alvo.nome || "Usuário Encontrado"}`);
                        console.log("=============================================\n");
                        console.log(JSON.stringify(alvo, null, 2));
                        return; // Encerra se achou
                    } else {
                        console.log(`   ⚠️ Usuário "${termo}" não encontrado nesta lista.`);
                        // Mostrar o primeiro para referência
                        if (lista.length > 0) {
                            console.log("   Exibindo o primeiro usuário da lista como exemplo:");
                            console.log(JSON.stringify(lista[0], null, 2));
                        }
                    }
                } else {
                    console.log("   ⚠️ Retorno não parece uma lista de usuários padrão:", JSON.stringify(data).substring(0, 200));
                }
                return; // Encerra após sucesso no endpoint
            } else {
                console.log(`   ❌ Falha (${response.status})`);
            }
        } catch (e) {
            console.log(`   ❌ Erro de conexão/request: ${e.message}`);
        }
    }

    console.log("❌ Não foi possível listar usuários em nenhum endpoint conhecido.");
}

inspectUser();
