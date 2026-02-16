
require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function testSave() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Testando Salvar (Strategy: Brute Force Endpoints)...");

    // Login
    const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });
    const dataLogin = await respLogin.json();
    const headers = { "Authorization": `Bearer ${dataLogin.accessToken || dataLogin.token}`, "Content-Type": "application/json" };

    const payload = {
        name: "Marcus Marcus Marcus",
        rg: "123456",
        dateStartLimit: "14/02/2026 00:00:00",
        dateLimit: "14/07/2026 23:59:59",
        expireOnDateLimit: true
    };

    // Lista de tentativas
    const attempts = [
        { method: "POST", url: "/api/users/" }, // Trailing slash
        { method: "POST", url: "/api/user/" },
        { method: "POST", url: "/api/people/" },
        { method: "POST", url: "/api/v1/users" },
        { method: "POST", url: "/api/v1/people" },
        { method: "POST", url: "/api/cadastros/pessoas" },
        { method: "POST", url: "/api/cadastros/usuarios" },
        { method: "PUT", url: "/api/users/" },
        { method: "PUT", url: "/api/user/" },
        // Com ID 0 no body
        { method: "POST", url: "/api/users", bodyMod: { id: 0 } },
        { method: "POST", url: "/api/users/", bodyMod: { id: 0 } },
    ];

    for (const att of attempts) {
        console.log(`\n🔄 Tentando ${att.method} ${att.url}...`);
        const p = { ...payload, ...(att.bodyMod || {}) };

        try {
            const resp = await fetch(`${ID_CONTROL_URL}${att.url}`, {
                method: att.method, headers, body: JSON.stringify(p)
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
