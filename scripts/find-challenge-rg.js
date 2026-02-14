
// Script do Desafio: Achar RG 599934748 (Versão Debug Probe)
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

    // TABUADA: Usar headers e body EXATAMENTE como no probe
    const r = await fetch(`${ID_CONTROL_URL}/api/user/list`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({}) // Objeto vazio como body
    });

    if (r.ok) {
        const text = await r.text(); // Ler como texto primeiro
        let lista = [];
        try {
            const json = JSON.parse(text);
            lista = Array.isArray(json) ? json : (json.content || json.data || []);
        } catch (e) {
            console.log("Erro parse JSON:", e.message);
        }

        console.log(`   📦 Total baixado: ${lista.length} usuários.`);

        const targetRG = "599934748";
        console.log(`🔍 Procurando RG: ${targetRG}...`);

        const found = lista.find(u => {
            if (!u.rg) return false;
            // Limpeza básica para garantir match
            return String(u.rg).replace(/[^a-zA-Z0-9]/g, "") === targetRG;
        });

        if (found) {
            console.log("\n✅ ACHEI! Aqui estão os dados:");
            console.log("--------------------------------------------------");
            console.log(`🆔 ID Interno: ${found.id}`);
            console.log(`👤 Nome:       ${found.name}`);
            console.log(`📄 RG:         ${found.rg}`);
            console.log(`📅 Data Limite: ${found.dateLimit}`);
            console.log(`🚫 Inativo:    ${found.inativo}`);
            console.log("--------------------------------------------------");
            console.log("\nDump Técnico (JSON):");
            console.log(JSON.stringify(found, null, 2));
        } else {
            console.log("❌ Não encontrado.");
        }

    } else {
        console.log("Erro lista:", r.status);
    }
}

run();
