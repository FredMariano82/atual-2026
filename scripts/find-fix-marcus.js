
// Script de "Força Bruta" para achar o Marcus e consertar o sync
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

    console.log("📥 Baixando lista GIGANTE (pode demorar)...");

    // Usando exatamente o método que funcionou no probe
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
        console.log(`   📦 Total baixado: ${lista.length} usuários.`);

        console.log("🔍 Procurando 'Marcus' de todas as formas...");

        const terms = ["marcus", "123456"];
        const found = lista.filter(u => {
            const json = JSON.stringify(u).toLowerCase();
            return terms.some(t => json.includes(t));
        });

        console.log(`\n🎯 ENCONTRADOS: ${found.length}`);

        found.forEach(u => {
            console.log("\n========================================");
            console.log(`ID: ${u.id}`);
            console.log(`Nome: ${u.name}`);
            console.log(`RG: ${u.rg}`);
            console.log(`Dates: ${u.dateStartLimit} a ${u.dateLimit}`);
            console.log(`JSON Raw: ${JSON.stringify(u)}`);
        });

        if (found.length > 0) {
            console.log("\n✅ ACHEI! O ID dele é: " + found[0].id);
            console.log("👉 DICA: Copie esse ID e coloque na coluna 'id_control_id' do Supabase para o Marcus.");
            console.log("   Isso vai parar o erro de 'RG já existe' e forçar o Update.");
        }

    } else {
        console.log("Erro lista:", r.status);
    }
}

run();
