
require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function testCreate() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // 1. Login
    console.log("🔑 Logando...");
    const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });
    const dataLogin = await respLogin.json();
    const token = dataLogin.accessToken || dataLogin.token;

    if (!token) {
        console.error("❌ Falha login");
        return;
    }

    // 2. Payload F12 (SEM O CAMPO "id")
    const randomId = Math.floor(Math.random() * 100000);
    const payload = {
        "credits": [],
        "canUseFacial": true,
        "inativo": false,
        "blackList": false,
        "contingency": false,
        "cards": [],
        "groupsList": [],
        "shelfStartLifeDate": "", // Datas vazias por enquanto, foco na criação
        "shelfLifeDate": "",
        "customFields": {},
        "name": `Test Script User ${randomId}`,
        "idDevice": String(randomId), // String numérica
        "rg": String(randomId),
        "cpf": "",
        "comments": "Criado via Script curl-replica",
        "pis": 0,
        "shelfLife": null,
        "shelfStartLife": null,
        "groups": [],
        "foto": null,
        "fotoDoc": null
    };

    console.log("📤 Enviando Payload (IGUAL F12)...");
    console.log(JSON.stringify(payload, null, 2));

    const respCreate = await fetch(`${ID_CONTROL_URL}/api/user/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    const status = respCreate.status;
    const text = await respCreate.text();

    console.log(`📡 Status: ${status}`);
    console.log(`📄 Resposta: ${text}`);
}

testCreate();
