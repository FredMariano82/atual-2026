
// Script de Probe para descobrir endpoint de Update
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
    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    const payload = {
        id: TARGET_ID,
        name: "Marcus Update Probe",
        dateStartLimit: `/Date(${Date.now()}-0300)/`,
        expireOnDateLimit: true
    };

    const tests = [
        { m: "PUT", u: `/api/user/${TARGET_ID}` },
        { m: "POST", u: `/api/user/${TARGET_ID}` },
        { m: "PATCH", u: `/api/user/${TARGET_ID}` },
        { m: "POST", u: `/api/user/save` },
        { m: "POST", u: `/api/user/update` },
        { m: "PUT", u: `/api/users/${TARGET_ID}` },
        { m: "POST", u: `/api/users` }, // Plural?
    ];

    console.log("\n🧪 Iniciando Probe de Updates...");

    for (const t of tests) {
        try {
            console.log(`👉 Testando [${t.m}] ${t.u}...`);
            const r = await fetch(`${ID_CONTROL_URL}${t.u}`, {
                method: t.m,
                headers: headers,
                body: JSON.stringify(payload)
            });

            console.log(`   Status: ${r.status} ${r.statusText}`);
            if (r.ok) {
                console.log("   ✅ SUCESSO! (Provável endpoint correto)");
                const json = await r.json().catch(() => "Sem JSON");
                console.log("   Resp:", JSON.stringify(json).substring(0, 100));
            } else {
                const txt = await r.text();
                // Limitar tamanho do erro HTML
                console.log(`   ❌ Falha. Resp: ${txt.substring(0, 50).replace(/\n/g, "")}`);
            }
        } catch (e) {
            console.log("   Erro Exception:", e.message);
        }
    }
}

run();
