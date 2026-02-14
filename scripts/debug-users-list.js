
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

    console.log("📥 Baixando /api/users...");
    const r = await fetch(`${ID_CONTROL_URL}/api/users`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (r.ok) {
        const d = await r.json();

        // Analisar estrutura
        const isArray = Array.isArray(d);
        const hasContent = d.content && Array.isArray(d.content);

        console.log(`\n📊 Estrutura da Resposta:`);
        console.log(`   É Array? ${isArray}`);
        console.log(`   Tem 'content'? ${hasContent}`);

        if (!isArray) {
            console.log(`   Chaves raiz: ${Object.keys(d).join(", ")}`);
            if (d.totalItems) console.log(`   Total Items: ${d.totalItems}`);
            if (d.totalPages) console.log(`   Total Pages: ${d.totalPages}`);
        }

        const lista = isArray ? d : (d.content || []);
        console.log(`   Itens retornados nesta requisição: ${lista.length}`);

        if (lista.length > 0) {
            console.log("\n   Primeiro item:", JSON.stringify(lista[0]).substring(0, 100) + "...");
            const marcus = lista.find(u => u.name.includes("Marcus"));
            console.log(`   Marcus encontrado na página? ${!!marcus}`);
        }

    } else {
        console.log("Erro req:", r.status);
    }
}

run();
