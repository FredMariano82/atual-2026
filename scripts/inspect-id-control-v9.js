// 🕵️ Script de Inspeção de Usuário ID Control (Versão 9 - Engenharia Reversa via ConfigUI)
// Executar: node scripts/inspect-id-control-v9.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = process.env.ID_CONTROL_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // O endpoint /api/util/configUI funcionou no navegador (200 OK)
    // Vamos chamar ele e ver se ele retorna URLs de outros serviços
    const ep = "/api/util/configUI";

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
    };

    try {
        console.log(`🔍 GET ${ep}...`);
        const resp = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });

        if (resp.ok) {
            console.log(`   ✅ SUCESSO!`);
            const data = await resp.json();
            console.log("   📦 Configuração Recebida:");
            console.log(JSON.stringify(data, null, 2));

            // Tentar inferir URLs a partir da config
            if (data.apiUrl || data.baseUrl) {
                console.log(`   💡 Dica de API encontrada: ${data.apiUrl || data.baseUrl}`);
            }
        } else {
            console.log(`   ❌ Status ${resp.status}`);
        }
    } catch (e) {
        console.log(`   ❌ Erro: ${e.message}`);
    }
}

inspectWithToken();
