
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function verifyDateUpdate() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Verificando Atualização de Datas (Pós-Fix Manual)...");

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

    // 2. PAYLOAD COM DATAS
    // Usando a estrutura que funcionou no Curl
    const payload = {
        id: 10023166, // ID Validado
        name: "Marcus Marcus Marcus",
        rg: "123456",
        document: "RG: 123456",
        // DATAS DE TESTE
        dateStartLimit: "15/02/2026 00:00:00",
        dateLimit: "15/07/2026 23:59:59",
        expireOnDateLimit: true,

        // Campos obrigatórios pelo que vimos
        customFields: {},
        templates: [],
        cards: [],
        groups: []
        // Adicionar outros se necessário
    };

    console.log("📤 Enviando Payload com Datas...");

    try {
        // Endpoint do Curl: /api/user/ (PUT)
        const url = `${ID_CONTROL_URL}/api/user/`;

        const resp = await fetch(url, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            console.log(`✅ SUCESSO TOTAL! Datas atualizadas. Status ${resp.status}`);
            console.log("   Confira no ID Control se as datas 15/02/2026 e 15/07/2026 apareceram.");
        } else {
            console.log(`❌ Falha: ${resp.status}`);
            console.log("   Erro:", await resp.text());
        }
    } catch (e) {
        console.log(`❌ Erro requisição: ${e.message}`);
    }
}

verifyDateUpdate();
