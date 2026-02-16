
require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function verifyCreation() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // 1. Login
    console.log("🔑 Logando...");
    const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });
    const dataLogin = await respLogin.json();
    const token = dataLogin.accessToken || dataLogin.token;

    // 2. Buscar Usuário (Usando endpoint de busca genérica ou específica)
    // Tentar buscar pelo nome "Test Script User"
    console.log("🔍 Buscando usuário criado...");
    const respSearch = await fetch(`${ID_CONTROL_URL}/api/users?name=Test Script User`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (respSearch.ok) {
        const users = await respSearch.json();
        const found = users.find(u => u.name.includes("Test Script User"));
        if (found) {
            console.log("✅ Usuário Encontrado!");
            console.log(`   ID: ${found.id}`);
            console.log(`   Obs: ${found.comments}`);
            console.log(`   DeviceID: ${found.idDevice}`);
        } else {
            console.log("❌ Usuário não encontrado na lista.");
        }
    } else {
        console.log(`❌ Erro busca: ${respSearch.status}`);
    }
}

verifyCreation();
