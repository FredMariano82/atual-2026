// 🕵️ Script de Inspeção de Usuário ID Control (Versão 8 - Força Bruta de Endpoints)
// Executar: node scripts/inspect-id-control-v8.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = process.env.ID_CONTROL_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Lista expandida de endpoints baseada em versões antigas e novas do iDSecure/Control iD
    const endpoints = [
        "/api/sec/users",
        "/api/sec/user",
        "/api/access/users",
        "/api/access/user",
        "/api/mon/users", // Monitoramento
        "/api/cadastros/usuarios",
        "/api/cadastros/pessoas",
        "/api/v1/users",
        "/api/v1/people",
        "/v1/users",
        "/data/users",
        "/api/config/users",
        // Tentar buscar por ID direto se a lista falhar (usando ID da Abilia)
        "/api/users/10023165",
        "/api/people/10023165",
        "/api/sec/users/10023165"
    ];

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*"
    };

    console.log(`🔍 Testando ${endpoints.length} endpoints com Token Bearer...`);

    for (const ep of endpoints) {
        try {
            console.log(`   GET ${ep}...`);
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });

            if (resp.ok) {
                console.log(`   ✅ SUCESSO EM ${ep}! (Status ${resp.status})`);
                const text = await resp.text();

                try {
                    const data = JSON.parse(text);
                    console.log(`   📦 Tipo retorno: ${Array.isArray(data) ? "Array" : typeof data}`);
                    console.log("   📄 Conteúdo:", JSON.stringify(data, null, 2).substring(0, 500) + "...");
                    return; // Encerra se achou
                } catch {
                    console.log("   ⚠️ Retorno ok, mas não é JSON:", text.substring(0, 100));
                }
            } else {
                // console.log(`   ❌ Status ${resp.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Erro: ${e.message}`);
        }
    }
    console.log("❌ Nenhum endpoint funcionou.");
}

inspectWithToken();
