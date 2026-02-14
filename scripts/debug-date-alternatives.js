
// Script específico para testar datas no formato dd/mm/aaaa via POST
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";
const TARGET_ID = 10023166;

async function run() {
    console.log("🔐 Autenticando...");
    const loginResp = await fetch(`${ID_CONTROL_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });

    if (!loginResp.ok) return console.log("Erro login");
    const logData = await loginResp.json();
    const token = logData.accessToken || logData.token;

    // Helper genérico
    async function testField(fieldName, value, label) {
        console.log(`\n🧪 Testando [POST] campo '${fieldName}' com valor: ${value} (${label})`);

        // Payload com ID no body, método POST (tentativa de contornar 405 do PUT)
        // E setando useDateLimit=true só pra garantir
        const payload = {
            id: TARGET_ID,
            name: "Marcus Teste Data PT-BR",
            [fieldName]: value,
            useDateLimit: true,
            expireOnDateLimit: true
        };

        try {
            // Se POST /api/user se comportar como upsert/save
            const r = await fetch(`${ID_CONTROL_URL}/api/user`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!r.ok) {
                const txt = await r.text();
                console.log(`   ❌ Erro HTTP ${r.status} - ${txt.substring(0, 100)}`);
            } else {
                console.log("   ✅ Request enviado (HTTP 200). Verificando persistência...");

                // Check imediato
                const r2 = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const u = await r2.json();
                const val = u[fieldName];
                console.log(`   🔎 Valor lido de '${fieldName}': [${val}]`);

                if (val && String(val).includes("2026")) {
                    console.log("   ⭐⭐⭐ SUCESSO UPDATE! ⭐⭐⭐");
                }
            }
        } catch (e) {
            console.log("Erro Exception:", e.message);
        }
    }

    const VALIDADE = "31/12/2026";

    // 1. Tentar 'Validade'
    await testField("Validade", VALIDADE, "dd/mm/aaaa");

    // 2. Tentar 'shelfLife'
    await testField("shelfLife", VALIDADE, "dd/mm/aaaa");

    // 3. Tentar 'dateLimit' (o oficial) com esse formato
    await testField("dateLimit", VALIDADE, "dd/mm/aaaa");

    // 4. Tentar 'dateStartLimit' com esse formato
    await testField("dateStartLimit", "01/01/2026", "dd/mm/aaaa");
}

run();
