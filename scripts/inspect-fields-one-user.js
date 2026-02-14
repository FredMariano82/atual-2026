
// Script para listar TODOS os campos disponíveis de um usuário
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";
const TARGET_ID = 10023166;

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

    console.log(`Baixando dados brutos do ID ${TARGET_ID}...`);

    const r = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (r.ok) {
        const u = await r.json();

        let report = "=== LISTA DE CAMPOS DISPONÍVEIS ===\n";
        // Listar chaves ordenadas
        const keys = Object.keys(u).sort();

        keys.forEach(k => {
            let val = JSON.stringify(u[k]);
            if (val && val.length > 50) val = val.substring(0, 50) + "...";
            report += `${k}: ${val}\n`;
        });

        require('fs').writeFileSync('fields_dump.txt', report);
        console.log("Dump salvo em fields_dump.txt");
    } else {
        console.log("Erro:", r.status);
    }
}

run();
