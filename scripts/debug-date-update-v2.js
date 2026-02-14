
// Script de Debug Refinado
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

    // Helper para update e check
    async function testPayload(label, payload) {
        console.log(`\n🧪 TESTE: ${label}`);
        console.log("   Payload:", JSON.stringify(payload));

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
                console.log(`   ❌ FALHA HTTP ${r.status}: ${await r.text()}`);
                return;
            }
            console.log("   ✅ Update enviado (HTTP 200). Verificando...");

            // Check
            const rCheck = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const u = await rCheck.json();

            console.log(`   🔎 Start: [${u.dateStartLimit}]`);
            console.log(`   🔎 End:   [${u.dateLimit}]`);

            if (u.dateLimit || u.dateStartLimit) {
                console.log("   ⭐⭐⭐ PERSISTIU! ⭐⭐⭐");
            } else {
                console.log("   ⚠️  Não persistiu (Campos vazios).");
            }
        } catch (e) {
            console.log("Erro Exception:", e.message);
        }
    }

    const now = new Date();
    const nextYear = new Date(); nextYear.setFullYear(2027);

    // 1. Apenas nome (Controle)
    await testPayload("1. Apenas Nome (Baseline)", {
        name: "Marcus Marcus Marcus",
        id: TARGET_ID // Alguns apis exigem ID no body
    });

    // 2. Data Timestamp Puro
    await testPayload("2. Data Timestamp /Date(N)/", {
        name: "Marcus Marcus Marcus",
        dateStartLimit: `/Date(${now.getTime()})/`,
        dateLimit: `/Date(${nextYear.getTime()})/`,
        expireOnDateLimit: true
    });

    // 3. Data Timestamp com Offset
    await testPayload("3. Data Timestamp /Date(N-0300)/", {
        name: "Marcus Marcus Marcus",
        dateStartLimit: `/Date(${now.getTime()}-0300)/`,
        dateLimit: `/Date(${nextYear.getTime()}-0300)/`,
        expireOnDateLimit: true
    });

    // 4. Data ISO
    await testPayload("4. Data ISO String", {
        name: "Marcus Marcus Marcus",
        dateStartLimit: now.toISOString(),
        dateLimit: nextYear.toISOString(),
        expireOnDateLimit: true
    });
}

run();
