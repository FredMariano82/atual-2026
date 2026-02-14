
// Script para baixar e salvar raw user list
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
    try {
        const r = await fetch(`${ID_CONTROL_URL}/api/user/list`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: "{}" // Forçando string vazia JSON
        });

        console.log(`   Status: ${r.status}`);

        if (r.ok) {
            const d = await r.json();
            const lista = Array.isArray(d) ? d : (d.content || []);
            console.log(`   📦 Total: ${lista.length} usuários.`);

            require('fs').writeFileSync('users_dump.json', JSON.stringify(lista.slice(0, 5), null, 2));

            if (lista.length > 0) {
                const firstId = lista[0].id;
                console.log(`\n🕵️‍♂️ Investigando detalhes do ID ${firstId} (GET /api/user/${firstId})...`);
                const rDetail = await fetch(`${ID_CONTROL_URL}/api/user/${firstId}`, {
                    method: "GET",
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (rDetail.ok) {
                    const detail = await rDetail.json();
                    console.log("   ✅ Detalhes recuperados!");
                    console.log("   RG na lista:", lista[0].rg);
                    console.log("   RG no detalhe:", detail.rg);
                    console.log("   Dump Detalhe:", JSON.stringify(detail, null, 2));
                } else {
                    console.log("   ❌ Erro ao pegar detalhes:", rDetail.status);
                }
            }
        } else {
            console.log("Erro lista:", await r.text());
        }
    } catch (e) {
        console.error(e);
    }
}

run();
