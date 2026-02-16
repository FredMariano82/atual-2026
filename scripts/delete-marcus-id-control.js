
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function deleteMarcus() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🗑️ Tentando EXCLUIR Marcus Zumbi (ID 10023166)...");

    let sessionToken = null;

    // 1. LOGIN
    try {
        const response = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const data = await response.json();
        sessionToken = data.accessToken || data.token;
        console.log("✅ Login OK.");
    } catch (e) {
        console.error("❌ Erro login:", e.message);
        return;
    }

    const headers = {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
    };

    const idMarcus = 10023166;

    // Tentar endpoints de deleção
    const attempts = [
        { url: `/api/users/${idMarcus}`, method: "DELETE" },
        { url: `/api/user/${idMarcus}`, method: "DELETE" },
        { url: `/api/people/${idMarcus}`, method: "DELETE" },
        { url: `/api/persons/${idMarcus}`, method: "DELETE" }
    ];

    for (const att of attempts) {
        console.log(`\n🔄 Tentando ${att.method} ${att.url}...`);
        try {
            const resp = await fetch(`${ID_CONTROL_URL}${att.url}`, {
                method: att.method,
                headers: headers
            });

            if (resp.ok) {
                console.log(`✅ SUCESSO! Excluído com status ${resp.status}`);
                return;
            } else {
                console.log(`❌ Falha: ${resp.status} - ${await resp.text().catch(() => '')}`);
            }
        } catch (e) {
            console.log(`❌ Erro requisição: ${e.message}`);
        }
    }
}

deleteMarcus();
