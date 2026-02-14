// 🕵️ Script de Inspeção de Usuário ID Control (Versão Final - A Redenção)
// Executar: node scripts/inspect-id-control-final.js

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
// Token EXATO do cURL fornecido
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Endpoint EXATO do cURL
    const url = `${ID_CONTROL_URL}/api/user/10023165`;

    // Headers EXATOS do cURL (alguns são cruciais como Referer/Origin)
    const headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "authorization": `Bearer ${TOKEN}`,
        "priority": "u=1, i",
        "referer": "https://192.168.100.20:30443/",
        "sec-ch-ua": '"Not(A:Brand";v="8", "Chromium";v="144", "Google Chrome";v="144"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36"
    };

    try {
        console.log(`🔍 GET ${url}...`);
        const resp = await fetch(url, { headers });

        if (resp.ok) {
            console.log(`   ✅ SUCESSO ABSOLUTO!`);
            const data = await resp.json();
            console.log("=============================================");
            console.log(JSON.stringify(data, null, 2));
            console.log("=============================================");
        } else {
            console.log(`   ❌ Status ${resp.status}`);
            console.log(`   ❌ Texto: ${await resp.text()}`);
        }
    } catch (e) {
        console.log(`   ❌ Erro: ${e.message}`);
    }
}

inspectWithToken();
