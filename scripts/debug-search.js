
require('dotenv').config({ path: '.env.local' });
// const fetch = require('node-fetch'); // Usando nativo

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function run() {
    // 1. Login
    const loginResp = await fetch(`${ID_CONTROL_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });
    const logData = await loginResp.json();
    const token = logData.accessToken || logData.token;
    console.log("Token:", !!token);

    const headers = { "Authorization": `Bearer ${token}` };
    const rg = "123456";

    // 2. Testes
    const tests = [
        `/api/users?rg=${rg}`,
        `/api/users?document=${rg}`,
        `/api/users?q=${rg}`,
        `/api/users?search=${rg}`,
        `/api/users?filter=${rg}`,
        `/api/users` // Listar todos para ver estrutura
    ];

    for (const t of tests) {
        console.log(`\n🔍 Testando: ${t}`);
        try {
            const r = await fetch(`${ID_CONTROL_URL}${t}`, { headers });
            if (r.ok) {
                const d = await r.json();
                const arr = Array.isArray(d) ? d : (d.content || []);
                const count = arr.length;
                console.log(`   ✅ Status ${r.status}, Itens: ${count}`);

                // Se retornou itens, mostrar o primeiro para ver estrutura
                if (count > 0) {
                    const match = arr.find(u => u.rg === rg || u.cpf === rg);
                    if (match) console.log("   🎯 ENCONTRADO NA LISTA!", match.id, match.name, match.rg);
                    else console.log("   ⚠️ Retornou dados, mas RG não bate no filtro local.");
                }
            } else {
                console.log(`   ❌ Status ${r.status}`);
            }
        } catch (e) {
            console.log("   ❌ Erro:", e.message);
        }
    }
}

run();
