
// Script para achar o Marcus pelo RG exato
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
        console.log(`   📦 Total baixado: ${lista.length} usuários.`);

        console.log("🔍 Procurando EXATAMENTE pelo RG '123456'...");

        // Normaliza RG para remover pontos/traços e compara
        const found = lista.filter(u => {
            const rgLimpo = String(u.rg || "").replace(/[^a-zA-Z0-9]/g, "");
            return rgLimpo === "123456";
        });

        console.log(`\n🎯 ENCONTRADOS: ${found.length}`);

        if (found.length > 0) {
            found.forEach(u => {
                console.log("\n========================================");
                console.log(`ID: ${u.id}`);
                console.log(`Nome: ${u.name}`);
                console.log(`RG Original: '${u.rg}'`);
                console.log(`JSON Raw: ${JSON.stringify(u)}`);
            });
            console.log("\n✅ O ID CORRETO É: " + found[0].id);
        } else {
            console.log("❌ NENHUM usuário com RG '123456' encontrado na lista baixada.");
            console.log("   (Isso significa que o ID Control pode não estar retornando o RG corretamente na lista simplificada)");
        }

    } else {
        console.log("Erro lista:", r.status);
    }
}

run();
