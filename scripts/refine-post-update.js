
// Script para testar variações de formato de data e campo custom via POST
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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function test(fieldName, value, label) {
        console.log(`\n🧪 Testando [POST] '${fieldName}' com valor: ${value} (${label})`);

        const payload = {
            id: TARGET_ID,
            name: "Marcus Teste Refinado",
            [fieldName]: value
        };
        // Para dateLimit, precisamos das flags
        if (fieldName === "dateLimit" || fieldName === "dateStartLimit") {
            payload.expireOnDateLimit = true;
            payload.useDateLimit = true;
        }

        try {
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
                console.log(`   ❌ Erro HTTP ${r.status}`);
            } else {
                console.log("   ✅ Request enviado (HTTP 200).");

                await sleep(500); // Dar tempo para persistir

                const r2 = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const u = await r2.json();
                console.log(`   🔎 Lido '${fieldName}': [${u[fieldName]}]`);

                if (String(u[fieldName]).includes("2026") || String(u[fieldName]).includes("Teste")) {
                    console.log("   ⭐⭐⭐ UPDATE CONFIRMADO! ⭐⭐⭐");
                    process.exit(0);
                }
            }
        } catch (e) { console.log("Erro:", e.message); }
    }

    // 1. Tentar 'Validade' com string simples (para ver se salva algo)
    await test("Validade", "TesteValid", "String Simples");

    // 2. Tentar 'Validade' com formato YYYY-MM-DD
    await test("Validade", "2026-12-31", "YYYY-MM-DD");

    // 3. Tentar 'dateLimit' com YYYY-MM-DDT... (ISO mas com T)
    await test("dateLimit", "2026-12-31T23:59:59", "ISO Date-Time");

    // 4. Tentar 'shelfLife' com Timestamp numérico puro (sem /Date/)
    const future = new Date(); future.setFullYear(2028);
    await test("shelfLife", future.getTime(), "Number Time");

}

run();
