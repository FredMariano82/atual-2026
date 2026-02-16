
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function fixMarcusFinal() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 FIX FINAL - Usando endpoint descoberto via Curl...");

    // 1. LOGIN
    let sessionToken;
    try {
        const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const dataLogin = await respLogin.json();
        sessionToken = dataLogin.accessToken || dataLogin.token;
        console.log("✅ Login OK.");
    } catch (e) { console.error("Falha login"); return; }

    const headers = {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
    };

    // 2. PAYLOAD BASEADO NO CURL
    // O endpoint é /api/user/ (singular, com barra no final, método PUT)
    // O body deve conter o ID.
    const payload = {
        id: 10023166,
        name: "Marcus Marcus Marcus",
        rg: "123456",
        document: "RG: 123456",
        dateStartLimit: "14/02/2026 00:00:00",
        dateLimit: "14/07/2026 23:59:59",
        expireOnDateLimit: true,
        customFields: {} // Importante manter
    };

    console.log("📤 Enviando Payload:", JSON.stringify(payload, null, 2));

    try {
        const url = `${ID_CONTROL_URL}/api/user/`; // ATENÇÃO AQUI: /api/user/
        console.log(`🔄 Enviando PUT para ${url}...`);

        const resp = await fetch(url, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            console.log(`✅ SUCESSO! Status ${resp.status}`);
            console.log("   Retorno:", await resp.text());
        } else {
            console.log(`❌ Falha: ${resp.status}`);
            console.log("   Erro:", await resp.text());
        }
    } catch (e) {
        console.log(`❌ Erro requisição: ${e.message}`);
    }
}

fixMarcusFinal();
