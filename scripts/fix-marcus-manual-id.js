
require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function fixMarcusManual() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🔧 Tentando Consertar Marcus Manualmente (Enviando ID explícito)...");

    // Login
    let sessionToken;
    try {
        const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const dataLogin = await respLogin.json();
        sessionToken = dataLogin.accessToken || dataLogin.token;
    } catch (e) { console.error("Falha login"); return; }

    const headers = {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
    };

    const idMarcus = 10023166;

    // PAYLOAD "MÁGICO" - Enviando ID junto com os dados para forçar o sistema a "linkar"
    const payload = {
        id: idMarcus, // O PULO DO GATO
        name: "Marcus Marcus Marcus",
        rg: "123456",
        dateStartLimit: "14/02/2026 00:00:00",
        dateLimit: "14/07/2026 23:59:59",
        expireOnDateLimit: true
    };

    // Tentar endpoints de SALVAMENTO/CRIAÇÃO, pois UPDATE (PUT) falhou.
    // Talvez o POST /api/users aceite ID para "upsert" (atualizar ou criar).
    const attempts = [
        { method: "POST", url: "/api/users" },
        { method: "POST", url: "/api/users/save" },
        { method: "PUT", url: `/api/users/${idMarcus}` } // Tentar PUT de novo com ID no body
    ];

    for (const att of attempts) {
        console.log(`\n🔄 Tentando ${att.method} ${att.url} com ID no body...`);
        try {
            const resp = await fetch(`${ID_CONTROL_URL}${att.url}`, {
                method: att.method, headers, body: JSON.stringify(payload)
            });

            if (resp.ok) {
                console.log(`✅ SUCESSO! Status ${resp.status}`);
                console.log(await resp.text());
                return;
            } else {
                console.log(`❌ Falha: ${resp.status}`);
            }
        } catch (e) { console.log(`Erro: ${e.message}`); }
    }
}

fixMarcusManual();
