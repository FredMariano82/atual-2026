
// Script específico para encontrar o Marcus e ver seus dados
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
            body: "{}" // Força payload vazio
        });

        if (r.ok) {
            const d = await r.json();
            const lista = Array.isArray(d) ? d : (d.content || []);
            console.log(`   📦 Total: ${lista.length} usuários.`);

            // Procurar por Marcus
            const matches = lista.filter(u =>
                (u.name && u.name.toLowerCase().includes("marcus")) ||
                (u.rg && String(u.rg).includes("123456"))
            );

            console.log(`\n🔍 Encontrados ${matches.length} usuários parecidos:`);
            matches.forEach(u => {
                console.log("\n--------------------------------------------------");
                console.log(`ID: ${u.id}`);
                console.log(`Name: ${u.name}`);
                console.log(`RG: '${u.rg}'`);
                console.log(`DateStartLimit: ${u.dateStartLimit}`);
                console.log(`DateLimit: ${u.dateLimit}`);
                console.log(`Inativo: ${u.inativo}`);
                console.log("Dump completo:", JSON.stringify(u, null, 2));
            });

            if (matches.length === 0) {
                console.log("❌ NENHUM 'Marcus' ou RG '123456' ENCONTRADO NA LISTA!");
                // Dump first item to ensure structure is correct
                if (lista.length > 0) {
                    console.log("Exemplo de usuário (primeiro da lista):");
                    console.log(JSON.stringify(lista[0], null, 2));
                }
            }

        } else {
            console.log("Erro lista:", r.status, await r.text());
        }
    } catch (e) {
        console.error(e);
    }
}

run();
