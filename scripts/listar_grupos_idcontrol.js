// Script para listar Grupos e Empresas do ID Control
// Executar: node scripts/listar_grupos_idcontrol.js

require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function loginIdControl() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
        console.log("🔐 Tentando logar em ID Control...");
        const response = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);

        const data = await response.json();
        const token = data.accessToken || data.token;
        console.log("✅ Login sucesso!");
        return token;
    } catch (e) {
        console.error("❌ Erro login:", e.message);
        return null;
    }
}

async function listarAtivos(token, endpoint, nome) {
    try {
        console.log(`\n🔍 Listando ${nome} (${endpoint})...`);
        const response = await fetch(`${ID_CONTROL_URL}${endpoint}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(`✅ ${nome} encontrados: ${Array.isArray(data) ? data.length : 1}`);
            console.dir(data, { depth: 2, colors: true });
        } else {
            console.log(`⚠️ Falha ao listar ${nome}: ${response.status}`);
        }
    } catch (e) {
        console.error(`❌ Erro ao listar ${nome}:`, e.message);
    }
}

async function main() {
    const token = await loginIdControl();
    if (!token) return;

    // TentarEndpoints comuns
    await listarAtivos(token, "/api/groups", "Grupos");
    await listarAtivos(token, "/api/companies", "Empresas");
    await listarAtivos(token, "/api/customfields", "Campos Personalizados");

    // Tentar listar um usuário existente para ver a estrutura de grupos dele
    // console.log("\n🕵️ Buscando usuário exemplo (Ligia) para ver estrutura...");
    // const userId = ... (precisaria buscar)
}

main();
