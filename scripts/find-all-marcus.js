
// Script para listar TODOS os "Marcus" do sistema
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

    // TABUADA: Usar headers e body EXATAMENTE como no probe que funcionou
    const r = await fetch(`${ID_CONTROL_URL}/api/user/list`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: "{}" // String pura, sem JSON.stringify novamente se for constante
    });

    if (r.ok) {
        const text = await r.text();
        let lista = [];
        try {
            const json = JSON.parse(text);
            lista = Array.isArray(json) ? json : (json.content || json.data || []);
        } catch (e) {
            console.log("Erro parse JSON:", e.message);
        }

        console.log(`   📦 Total baixado: ${lista.length} usuários.`);

        console.log(`🔍 Procurando por nome contendo 'MARCUS'...`);

        const found = lista.filter(u => {
            if (!u.name) return false;
            return u.name.toLowerCase().includes("marcus");
        });

        console.log(`\n🎯 ENCONTRADOS: ${found.length}`);

        let output = "";
        if (found.length > 0) {
            output += "ID       | RG           | Nome\n";
            output += "---------|--------------|-----------------------------------\n";
            found.forEach(u => {
                const rg = String(u.rg || "").padEnd(12);
                const id = String(u.id).padEnd(8);
                output += `${id} | ${rg} | ${u.name}\n`;
            });
            output += "------------------------------------------------------------\n";
        } else {
            output = "❌ NENHUM 'Marcus' encontrado na lista.\n";
        }
        require('fs').writeFileSync('marcus_results.txt', output);
        console.log("Arquivo salvo: marcus_results.txt");

    } else {
        console.log("Erro lista:", r.status);
    }
}

run();
