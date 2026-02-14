
// Script para testar campos customizados e comentários
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
            name: "Marcus Teste Final",
            [fieldName]: value
        };
        // Para dateLimit, precisamos das flags
        if (fieldName === "dateLimit" || fieldName === "dateStartLimit") {
            payload.expireOnDateLimit = true;
            payload.useDateLimit = true;
            payload.idArea = 1; // Default
            payload.idType = 0; // Default
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
                await sleep(500);

                const r2 = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const u = await r2.json();
                console.log(`   🔎 Valor lido '${fieldName}': [${u[fieldName]}]`);

                if (String(u[fieldName]).includes("Teste") || String(u[fieldName]).includes("2026") || String(u[fieldName]) === String(value)) {
                    console.log("   ⭐⭐⭐ UPDATE SUCESSO! ⭐⭐⭐");
                }
            }
        } catch (e) { console.log("Erro:", e.message); }
    }

    let results = "";
    const log = console.log;
    console.log = (msg) => { log(msg); results += msg + "\n"; };

    // 1. Testar campo CONTROL (Comentários) - Devo conseguir
    await test("comments", "TesteComentario_" + Date.now(), "String Comentário");

    // 2. Testar 'Validade'
    await test("Validade", "31/12/2026", "dd/mm/yyyy");

    // 3. Testar 'Validade' - ISO Format YYYY-MM-DD
    await test("Validade", "2026-12-31", "YYYY-MM-DD");

    // 4. Testar 'shelfLife' Timestamp
    const future = new Date(); future.setFullYear(2028);
    await test("shelfLife", `/Date(${future.getTime()}-0300)/`, "Timestamp");

    // 5. Testar 'dateLimit' Timestamp (Com Contexto)
    await test("dateLimit", `/Date(${future.getTime()}-0300)/`, "Timestamp Context");

    require('fs').writeFileSync('final_debug_report.txt', results);
}

run();
