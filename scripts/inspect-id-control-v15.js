// 🕵️ Script de Inspeção de Usuário ID Control (Versão 15 - IDs Capturados, Agora os Dados!)
// Executar: node scripts/inspect-id-control-v15.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Já sabemos que /api/util/getAllUndeletedIds/Users FUNCIONA.
    // Agora precisamos do endpoint que pega os DETALHES.
    // Padrões comuns em APIs que usam 'getAllUndeletedIds':
    // 1. /api/util/getUpdatedSince/Users?date=1970-01-01 (Pega tudo)
    // 2. /api/util/load/Users?ids=10023165
    // 3. POST /api/util/load/Users { ids: [...] }

    // Abilia ID: 10023165

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Referer": "https://192.168.100.20:30443/"
    };

    const targets = [
        // Tentativa A: getUpdatedSince (muito provável ser o par do getAllUndeletedIds)
        // Precisamos mandar uma data antiga para vir tudo ou o usuário específico
        { method: "GET", url: "/api/util/getUpdatedSince/Users?date=2000-01-01T00:00:00" },

        // Tentativa B: Load especifico
        { method: "POST", url: "/api/util/load/Users", body: { ids: [10023165] } },
        { method: "POST", url: "/api/util/load", body: { entity: "Users", ids: [10023165] } },

        // Tentativa C: Get direto
        { method: "GET", url: "/api/util/Users/10023165" }
    ];

    console.log(`🔍 Buscando DADOS da Abilia (ID 10023165)...`);

    for (const t of targets) {
        try {
            console.log(`   ${t.method} ${t.url}...`);
            const opts = { method: t.method, headers };
            if (t.body) opts.body = JSON.stringify(t.body);

            const resp = await fetch(`${ID_CONTROL_URL}${t.url}`, opts);

            if (resp.ok) {
                console.log(`   ✅ RESP 200 OK!`);
                const text = await resp.text();

                try {
                    const data = JSON.parse(text);
                    // verificar se tem a Abilia nos dados
                    const strData = JSON.stringify(data);
                    if (strData.includes("Abilia") || strData.includes("10023165")) {
                        console.log("   🎯 DADOS DA ABILIA ENCONTRADOS!");
                        console.log("=============================================");
                        console.log(JSON.stringify(data, null, 2).substring(0, 3000)); // Limitado
                        console.log("=============================================");
                        return;
                    } else {
                        console.log("   ⚠️ Retornou dados, mas não vi 'Abilia'. Exemplo:", strData.substring(0, 200));
                    }
                } catch {
                    console.log("   ⚠️ Não é JSON:", text.substring(0, 100));
                }
            } else {
                console.log(`   ❌ Status ${resp.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Erro: ${e.message}`);
        }
    }
}

inspectWithToken();
