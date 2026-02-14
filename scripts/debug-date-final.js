
// Script de Debug Final de Datas
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

    async function test(label, payload) {
        console.log(`\n🧪 ${label}`);
        try {
            const r = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (!r.ok) {
                console.log(`   ❌ Erro ${r.status}`);
                return;
            }

            // Verify
            const r2 = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const u = await r2.json();
            console.log(`   🔎 Start: ${u.dateStartLimit}`);
            console.log(`   🔎 End:   ${u.dateLimit}`);

            if (u.dateLimit) console.log("   ✅✅✅ SUCESSO! ✅✅✅");
        } catch (e) { console.log("Erro:", e.message); }
    }

    const now = new Date();
    const future = new Date(); future.setFullYear(2028);

    // 1. Timestamp ID Control (Com e sem offset)
    await test("1. Timestamp com Offset (-0300)", {
        name: "Marcus Update Teste 1",
        dateStartLimit: `/Date(${now.getTime()}-0300)/`,
        dateLimit: `/Date(${future.getTime()}-0300)/`,
        expireOnDateLimit: true
    });

    await test("2. Timestamp SEM Offset", {
        name: "Marcus Update Teste 2",
        dateStartLimit: `/Date(${now.getTime()})/`,
        dateLimit: `/Date(${future.getTime()})/`,
        expireOnDateLimit: true
    });

    // 3. ISO
    await test("3. ISO String", {
        name: "Marcus Update Teste 3",
        dateStartLimit: now.toISOString(),
        dateLimit: future.toISOString(),
        expireOnDateLimit: true
    });

    // 4. String Simples
    await test("4. String PT-BR (dd/mm/yyyy)", {
        name: "Marcus Update Teste 4",
        dateStartLimit: "14/02/2026",
        dateLimit: "14/02/2028",
        expireOnDateLimit: true
    });
}

run();
