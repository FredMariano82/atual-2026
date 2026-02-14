// 🕵️ Script de Inspeção de Usuário ID Control (Versão 14 - Insistência Inteligente)
// Executar: node scripts/inspect-id-control-v14.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // O cURL mostrava: /api/util/getAllUndeletedIds/Users
    // Vamos testar variações de método e barra final

    // Também, notei que o cURL tem muitos headers.
    // Às vezes o servidor recusa se faltar o 'Referer' ou 'Origin'.

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Referer": "https://192.168.100.20:30443/",
        "Origin": "https://192.168.100.20:30443",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    };

    const targets = [
        { url: "/api/util/getAllUndeletedIds/Users", method: "GET" },
        { url: "/api/util/getAllUndeletedIds/Users", method: "POST" }, // Talvez seja POST?
        { url: "/api/util/getAllUndeletedIds", method: "POST", body: { entity: "Users" } },

        // Tentar endpoint de CARREGAR (já que 'getAllUndeletedIds' só traz IDs)
        // Se o padrão é /api/util/VERBO/ENTIDADE
        { url: "/api/util/load/Users", method: "POST", body: { ids: [10023165] } },
        { url: "/api/util/get/Users", method: "POST", body: { id: 10023165 } },
        { url: "/api/util/Users/10023165", method: "GET" }
    ];

    console.log(`🔍 Testando endpoints com Headers completos...`);

    for (const t of targets) {
        try {
            console.log(`   ${t.method} ${t.url}...`);
            const opts = { method: t.method, headers };
            if (t.body) opts.body = JSON.stringify(t.body);

            const resp = await fetch(`${ID_CONTROL_URL}${t.url}`, opts);

            if (resp.ok) {
                console.log(`   ✅ SUCESSO!`);
                const text = await resp.text();
                console.log("   📦 Resposta:", text.substring(0, 500));
                return;
            } else {
                console.log(`   ❌ Status ${resp.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Erro: ${e.message}`);
        }
    }
}

inspectWithToken();
