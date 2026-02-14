const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function inspect() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Ignorar erro de certificado auto-assinado

    console.log("🔐 Autenticando no ID Control...");
    let token = null;

    try {
        const loginResp = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });

        if (!loginResp.ok) throw new Error(`Login falhou: ${loginResp.status}`);
        const loginData = await loginResp.json();
        // Exibir dados do login para pistas
        console.log("⬇️ DADOS DO LOGIN:");
        console.log(JSON.stringify(loginData, null, 2));
        token = loginData.accessToken || loginData.token;
        console.log("✅ Token obtido!");
    } catch (e) {
        console.error("❌ Erro no login:", e.message);
        return;
    }

    console.log("🔍 Buscando usuários para ver a estrutura...");

    // Tentando endpoint padrão de listagem
    // Lista de endpoints para tentar
    const endpoints = [
        '/api/me',
        '/api/user',    // Tentar pegar o user atual ou lista
        '/api/users',   // Retentar
        '/api/adhesions',
        '/api/cards'
    ];

    for (const ep of endpoints) {
        try {
            console.log(`\n--- Tentando endpoint: ${ep} ---`);
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (resp.ok) {
                const data = await resp.json();
                console.log(`✅ SUCESSO no endpoint: ${ep}`);
                console.log(JSON.stringify(data, null, 2).substring(0, 1000));
            } else {
                console.log(`❌ Falhou (${resp.status}): ${resp.statusText}`);
            }
        } catch (e) {
            console.log(`❌ Erro requisição: ${e.message}`);
        }
    }
}

inspect();
