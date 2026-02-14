
// Script de Debug: Testar 3 formatos de data no Marcus (10023166)
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

    // Helper para update
    async function tryUpdate(label, payload) {
        console.log(`\n🧪 Testando: ${label}`);
        console.log("   Payload:", JSON.stringify(payload));

        const r = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!r.ok) {
            console.log("   ❌ Erro HTTP:", r.status, await r.text());
            return;
        }

        // Check result
        const rCheck = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
            method: "GET",
            headers: { "Authorization": `Bearer ${token}` }
        });
        const u = await rCheck.json();
        console.log(`   🔎 Resultado: Start=${u.dateStartLimit} | End=${u.dateLimit} | useDateLimit=${u.useDateLimit}`);

        if (u.dateLimit) {
            console.log("   ⭐⭐⭐ SUCESSO! ⭐⭐⭐");
            process.exit(0); // Stop entirely if found
        }
    }

    const now = new Date();
    const nextYear = new Date(); nextYear.setFullYear(2027);

    // TESTE 1: Tentar com flag `useDateLimit` e `expireOnDateLimit`
    await tryUpdate("1. Adicionando useDateLimit: true", {
        name: "Marcus Marcus Marcus",
        dateStartLimit: `/Date(${now.getTime()})/`,
        dateLimit: `/Date(${nextYear.getTime()})/`,
        expireOnDateLimit: true,
        useDateLimit: true // <--- NOVA TENTATIVA
    });

    // TESTE 2: Formato ISO String
    await tryUpdate("2. Formato ISO String", {
        name: "Marcus Marcus Marcus",
        dateStartLimit: now.toISOString(), // 2025-02-14T...
        dateLimit: nextYear.toISOString(),
        expireOnDateLimit: true
    });

    // TESTE 3: Formato ID Control (Timestamp puro sem offset)
    await tryUpdate("3. Timestamp puro /Date(123)/", {
        name: "Marcus Marcus Marcus",
        dateStartLimit: `/Date(${now.getTime()})/`,
        dateLimit: `/Date(${nextYear.getTime()})/`,
        expireOnDateLimit: true
    });

    // TESTE 4: Formato ID Control com offset (o original)
    await tryUpdate("4. Timestamp com offset /Date(123-0300)/", {
        name: "Marcus Marcus Marcus",
        dateStartLimit: `/Date(${now.getTime()}-0300)/`,
        dateLimit: `/Date(${nextYear.getTime()}-0300)/`,
        expireOnDateLimit: true
    });

}

run();
