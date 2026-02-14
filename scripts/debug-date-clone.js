
// Clone Exato do Sync apenas para teste de Update
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

let sessionToken = null;

async function loginIdControl() {
    try {
        console.log("🔐 Autenticando no ID Control...");
        const response = await fetch(`${ID_CONTROL_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const data = await response.json();
        sessionToken = data.accessToken || data.token;
        return true;
    } catch (e) {
        console.error("❌ Erro no login:", e.message);
        return false;
    }
}

async function updateUser(id, payload) {
    console.log(`\n📤 Enviando Update para ID ${id}...`);
    console.log("Display Payload:", JSON.stringify(payload, null, 2));

    try {
        // Tentar POST para /api/user (Upsert?)
        // E incluir ID no body
        const payloadWithId = { ...payload, id: id };

        console.log("Tentando POST /api/user com ID no body...");
        const response = await fetch(`${ID_CONTROL_URL}/api/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            },
            body: JSON.stringify(payloadWithId)
        });

        if (!response.ok) {
            const txt = await response.text();
            console.log(`❌ Erro ${response.status}: ${txt}`);
        } else {
            console.log("✅ Update SUCESSO!");

            // Check immediately
            const r2 = await fetch(`${ID_CONTROL_URL}/api/user/${id}`, {
                method: "GET",
                headers: { "Authorization": `Bearer ${sessionToken}` }
            });
            const u = await r2.json();
            console.log(`🔎 Start: ${u.dateStartLimit}`);
            console.log(`🔎 End:   ${u.dateLimit}`);
        }
    } catch (e) {
        console.error("❌ Erro update:", e.message);
    }
}

async function run() {
    await loginIdControl();

    // Payload IDÊNTICO ao do sync script que funcionou
    // exceto pelas datas hardcoded e flags extras
    const payload = {
        name: "Marcus Marcus Marcus",
        comments: "checagem válida até 31/12/2026",

        // Tentativa 3: Flags explícitas + Formato /Date/ (Microsoft)
        useDateLimit: true,
        expireOnDateLimit: true,

        dateStartLimit: `/Date(${Date.now()}-0300)/`,
        dateLimit: `/Date(${Date.now() + 86400000}-0300)/`,
    };

    await updateUser(10023166, payload);
}

run();
