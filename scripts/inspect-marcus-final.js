
// Script para ver como estão as datas do Marcus AGORA
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

    console.log(`🔍 Baixando dados do ID ${TARGET_ID}...`);

    const r = await fetch(`${ID_CONTROL_URL}/api/user/${TARGET_ID}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
    });

    if (r.ok) {
        const u = await r.json();
        let report = "\nDATA REPORT FOR MARCUS (ID 10023166):\n";
        report += "--------------------------------------------------\n";
        report += `dateStartLimit:    ${u.dateStartLimit}\n`;
        report += `dateLimit:         ${u.dateLimit}\n`;
        report += `expireOnDateLimit: ${u.expireOnDateLimit}\n`;
        report += `useDateLimit:      ${u.useDateLimit}\n`;
        report += `inativo:           ${u.inativo}\n`;
        report += "--------------------------------------------------\n";

        require('fs').writeFileSync('inspect_marcus_report.txt', report);
        console.log("Report salvo em inspect_marcus_report.txt");
    } else {
        console.log("Erro:", r.status);
    }
}

run();
