// 🕵️ Script de Inspeção de Usuário ID Control (Versão 11 - Caça ao Namespace)
// Executar: node scripts/inspect-id-control-v11.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = process.env.ID_CONTROL_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // A configUI revelou chaves como "/list_visitor". 
    // Tentamos /api/list_visitor e falhou (404).
    // ConfigUI estava em /api/util/configUI.

    // Hipóteses de Namespace:
    const namespaces = [
        "/api",
        "/api/util",
        "/api/core",
        "/api/service",
        "/api/v1",
        "" // Raiz
    ];

    const actions = [
        "/list_visitor",
        "/list_people",
        "/list_users",
        "/list_person"
    ];

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
    };

    console.log(`🔍 Testando combinações de Namespace + Action...`);

    for (const ns of namespaces) {
        for (const action of actions) {
            const url = `${ID_CONTROL_URL}${ns}${action}`;
            try {
                // Tentando POST (comum RPC) e GET
                const respPost = await fetch(url, {
                    method: "POST", headers,
                    body: JSON.stringify({ limit: 1 })
                });

                if (respPost.ok) {
                    console.log(`   ✅ SUCESSO POST ${url}!`);
                    const data = await respPost.json();
                    console.log("   📦 Resposta:", JSON.stringify(data).substring(0, 500));
                    return;
                } else if (respPost.status !== 404) {
                    console.log(`   ⚠️ POST ${url} -> ${respPost.status} (Interessante!)`);
                }

            } catch (e) {
                // Ignore errors
            }
        }
    }
    console.log("❌ Nenhuma combinação funcionou.");
}

inspectWithToken();
