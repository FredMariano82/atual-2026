
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function verifyDateUpdateSimple() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Verificando Atualização de Datas SIMPLE (DD/MM/YYYY)...");

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
        "Content-Type": "application/json;charset=UTF-8"
    };

    // 2. PAYLOAD COM DATAS SIMPLES
    const payload = {
        id: 10023166,
        name: "Marcus Marcus Marcus",
        rg: "123456",
        document: "RG: 123456",
        // DATAS SEM HORA
        dateStartLimit: "15/02/2026",
        dateLimit: "15/07/2026",
        expireOnDateLimit: true,
        customFields: {},
        templates: [],
        cards: [],
        groups: []
    };

    console.log("📤 Enviando Payload com Datas DD/MM/YYYY...", JSON.stringify(payload));

    try {
        const url = `${ID_CONTROL_URL}/api/user/`;

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

verifyDateUpdateSimple();
