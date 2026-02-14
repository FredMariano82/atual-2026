// 🕵️ Script de Inspeção de Usuário ID Control (Versão 13 - A Revelação)
// Executar: node scripts/inspect-id-control-v13.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
// Token do cURL recente (vence em 2026, tranquilo)
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // URL descoberta via cURL: /api/util/getAllUndeletedIds/Users
    // Isso sugere que ela retorna uma lista de IDs.
    // MAS, pode ser que o endpoint principal de PEGAR DADOS seja parecido.

    // Vamos testar o endpoint exato primeiro
    const epIds = "/api/util/getAllUndeletedIds/Users";

    // E vamos tentar o endpoint de PEGAR DADOS DE UM ID
    // O ID da Abilia é 10023165
    // Hipóteses baseadas no namespace /api/util
    const epAbilia = [
        "/api/util/get/Users/10023165",
        "/api/util/get/Users?id=10023165",
        "/api/util/Users/10023165",
        "/api/data/Users/10023165"
    ];

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*"
    };

    try {
        console.log(`🔍 1. Testando endpoint de IDs: ${epIds}...`);
        const resp = await fetch(`${ID_CONTROL_URL}${epIds}`, { headers });
        if (resp.ok) {
            const data = await resp.json();
            console.log(`   ✅ SUCESSO! Retornou ${Array.isArray(data) ? data.length : '?'} itens.`);
            console.log("   Exemplo:", JSON.stringify(data[0] || data).substring(0, 100));
        } else {
            console.log(`   ❌ Falha: ${resp.status}`);
        }
    } catch (e) {
        console.log(`   ❌ Erro IDs: ${e.message}`);
    }

    console.log("\n🔍 2. Tentando buscar dados da ABILIA (ID 10023165)...");
    for (const ep of epAbilia) {
        try {
            console.log(`   GET ${ep}...`);
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });
            if (resp.ok) {
                const data = await resp.json();
                console.log(`   ✅ EUREKA! DADOS ENCONTRADOS!`);
                console.log("=============================================");
                console.log(JSON.stringify(data, null, 2));
                console.log("=============================================");
                return;
            }
        } catch (e) { }
    }
    console.log("❌ Não achei o endpoint de detalhes do usuário ainda.");
}

inspectWithToken();
