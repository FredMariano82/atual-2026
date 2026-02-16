
require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function testSave() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Testando Salvar (Strategy: ID in body)...");

    // Login
    const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });
    const dataLogin = await respLogin.json();
    const headers = { "Authorization": `Bearer ${dataLogin.accessToken || dataLogin.token}`, "Content-Type": "application/json" };

    const payload = {
        id: 10023166, // ID EXPLICITO
        name: "Marcus Marcus Marcus",
        document: "123456", // RG
        rg: "123456",
        dateStartLimit: "14/02/2026 00:00:00",
        dateLimit: "14/07/2026 23:59:59",
        expireOnDateLimit: true
    };

    const attempts = [
        { method: "POST", url: "/api/users", body: payload },
        { method: "POST", url: "/api/user", body: payload },
        { method: "POST", url: "/api/people", body: payload },
        { method: "PUT", url: "/api/users", body: payload }, // PUT na raiz com ID no body?
        { method: "POST", url: "/api/users/save", body: payload }
    ];

    for (const att of attempts) {
        console.log(`\n🔄 Tentando ${att.method} ${att.url}...`);
        try {
            const resp = await fetch(`${ID_CONTROL_URL}${att.url}`, {
                method: att.method, headers, body: JSON.stringify(att.body)
            });

            if (resp.ok) {
                console.log(`✅ SUCESSO! Status ${resp.status}`);
                console.log(await resp.text());
                return;
            } else {
                console.log(`❌ Falha: ${resp.status}`);
            }
        } catch (e) {
            console.log(`❌ Erro: ${e.message}`);
        }
    }
}

testSave();
