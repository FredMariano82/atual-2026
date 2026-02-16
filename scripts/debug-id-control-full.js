
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function debugIdControlFull() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Iniciando Diagnóstico Completo ID Control...");

    let sessionToken = null;

    // 1. LOGIN
    console.log("\n🔑 1. Tentando Login...");
    try {
        const response = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });

        if (!response.ok) {
            console.error(`❌ Falha no login: ${response.status} - ${await response.text()}`);
            return;
        }

        const data = await response.json();
        sessionToken = data.accessToken || data.token;
        console.log("✅ Login realizado! Token obtido.");
    } catch (e) {
        console.error("❌ Erro técnico no login:", e.message);
        return;
    }

    const headers = {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
    };

    // 2. DESCOBRIR USUÁRIO MARCUS
    console.log("\n🔍 2. Buscando usuário 'Marcus'...");

    // Tentar endpoints de listagem conhecidos ou busca
    // Vamos tentar listar todos (recente) ou buscar por ID se tivermos sorte com o ID 10023166 do Supabase
    const idMarcusSupabase = 10023166;

    const endpoints = [
        `/api/users?limit=100`, // Tentar listar
        `/api/users/${idMarcusSupabase}`, // Tentar direto pelo ID que temos
        `/api/people/${idMarcusSupabase}`,
        `/api/user/${idMarcusSupabase}`
    ];

    let marcusData = null;

    for (const ep of endpoints) {
        try {
            console.log(`   🔸 GET ${ep}...`);
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });
            if (resp.ok) {
                const data = await resp.json();

                // Se for array, procurar Marcus
                if (Array.isArray(data)) {
                    console.log(`      Retornou lista com ${data.length} itens.`);
                    const found = data.find(u =>
                        (u.name && u.name.toLowerCase().includes("marcus")) ||
                        (u.id == idMarcusSupabase)
                    );
                    if (found) {
                        marcusData = found;
                        console.log("      ✅ Marcus encontrado na lista!");
                        break;
                    }
                } else if (data.id || data.name) {
                    // Se for objeto direto
                    console.log("      ✅ Objeto retornado direto!");
                    marcusData = data;
                    break;
                }
            }
        } catch (e) {
            console.log(`      Erro requisição: ${e.message}`);
        }
    }

    // 3. ANÁLISE PROFUNDA
    if (marcusData) {
        console.log("\n📦 3. DUMP COMPLETO DO USUÁRIO:");
        console.log("---------------------------------------------------");
        console.log(JSON.stringify(marcusData, null, 2));
        console.log("---------------------------------------------------");

        // Salvar em arquivo
        const fs = require('fs');
        fs.writeFileSync('id_control_marcus_dump.json', JSON.stringify(marcusData, null, 2));
        console.log("💾 Salvo em 'id_control_marcus_dump.json'");

        // Sugestão de campos
        console.log("\n🕵️ Análise de Campos de Data:");
        const keys = Object.keys(marcusData);
        const dateKeys = keys.filter(k => k.toLowerCase().includes("date") || k.toLowerCase().includes("time") || k.toLowerCase().includes("start") || k.toLowerCase().includes("end") || k.toLowerCase().includes("limit"));
        console.log("   Campos suspeitos:", dateKeys);

    } else {
        console.log("\n❌ Não consegui encontrar o cadastro do Marcus para analisar.");
        console.log("   Sugestão: Use o procedimento F12 no navegador para ver o payload de salvar usuário.");
    }
}

debugIdControlFull();
