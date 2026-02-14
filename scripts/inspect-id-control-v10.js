// 🕵️ Script de Inspeção de Usuário ID Control (Versão 10 - Endpoints Revelados)
// Executar: node scripts/inspect-id-control-v10.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
// Token hardcoded para teste rápido (idealmente via env var)
const TOKEN = process.env.ID_CONTROL_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // A configUI revelou endpoints como "/list_visitor".
    // Precisamos descobrir o prefixo correto. Geralmente é /api/endpoint ou apenas /endpoint
    // A configUI estava em /api/util/configUI.

    const endpoints = [
        "/api/list_visitor",    // Prefixo provável
        "/api/list_people",     // Tentativa baseada em padrão
        "/api/list_visitors",
        "/api/visitor/list",
        "/list_visitor",        // Prefixo raiz
        "/api/list_users",      // Se users for a entidade base
        "/api/list_user"
    ];

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json"
    };

    console.log(`🔍 Testando endpoints de LISTAGEM...`);

    // Payload de listagem padrão (muitas vezes APIs RPC exigem paginação ou filtro vazio)
    const payload = {
        limit: 10,
        page: 1
    };

    for (const ep of endpoints) {
        try {
            console.log(`   POST ${ep}...`);
            // APIs RPC costumam usar POST para tudo
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, {
                method: "POST",
                headers,
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                console.log(`   ✅ SUCESSO EM ${ep}!`);
                const data = await resp.json();
                console.log("   📦 Resposta:");
                console.log(JSON.stringify(data, null, 2).substring(0, 1000));
                return;
            } else {
                console.log(`   ❌ Status ${resp.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Erro: ${e.message}`);
        }
    }
}

inspectWithToken();
