
// Script para inspecionar como o Marcus aparece na lista remota
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

    console.log("📥 Baixando lista completa (POST /api/user/list)...");
    const r = await fetch(`${ID_CONTROL_URL}/api/user/list`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({})
    });

    if (r.ok) {
        const d = await r.json();
        const lista = Array.isArray(d) ? d : (d.content || []);
        console.log(`   📦 Total: ${lista.length} usuários.`);

        // Logar o primeiro para ver a cara dele
        if (lista.length > 0) {
            console.log("\n🔍 Exemplo de usuário (primeiro da lista):");
            console.log(JSON.stringify(lista[0], null, 2));
        }

        // Procurar por Marcus ou RG 123456
        const marcus = lista.filter(u =>
            (u.name && u.name.toLowerCase().includes("marcus")) ||
            (u.rg && String(u.rg).includes("123456"))
        );

        console.log(`\n🔍 Encontrados ${marcus.length} usuários parecidos:`);
        marcus.forEach(u => {
            console.log("\n--------------------------------------------------");
            console.log(`ID: ${u.id}`);
            console.log(`Name: ${u.name}`);
            console.log(`RG: '${u.rg}' (Tipo: ${typeof u.rg})`);
            console.log(`CPF: '${u.cpf}'`);
            console.log(`Dates: Start=${u.dateStartLimit}, End=${u.dateLimit}`);
            console.log("Dump completo:", JSON.stringify(u, null, 2));
        });
    } else {
        console.log("Erro lista:", r.status);
    }
}

run();
