
// Script para pegar detalhes do ID 10023166 e provar que é o "ID 0" da tela
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

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

    const targetID = 10023166;
    console.log(`\n🕵️‍♂️ Baixando ficha completa do ID INTERNO ${targetID}...`);

    const r = await fetch(`${ID_CONTROL_URL}/api/user/${targetID}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (r.ok) {
        const u = await r.json();
        console.log("✅ DADOS RECEBIDOS:");
        console.log("--------------------------------------------------");
        console.log(`🆔 ID Banco de Dados (API): ${u.id}`);
        console.log(`📛 Nome:                    ${u.name}`);
        console.log(`📄 RG:                      ${u.rg}`);
        console.log(`📟 Matrícula (Tela?):       ${u.registration}`);
        console.log(`🔢 ID Device:               ${u.idDevice}`);
        console.log("--------------------------------------------------");
        console.log("JSON Original:", JSON.stringify(u, null, 2));
    } else {
        console.log("Erro:", r.status);
    }
}

run();
