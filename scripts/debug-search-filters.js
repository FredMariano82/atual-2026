
require('dotenv').config({ path: '.env.local' });
// const fetch = require('node-fetch'); // Usando nativo

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function run() {
    // 1. Login
    console.log("🔐 Autenticando...");
    const loginResp = await fetch(`${ID_CONTROL_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });

    if (!loginResp.ok) {
        console.log("❌ Falha login", loginResp.status);
        return;
    }

    const logData = await loginResp.json();
    const token = logData.accessToken || logData.token;
    const headers = { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" };

    const TARGET_RG = "123456";
    const TARGET_NAME = "Marcus";

    // 2. Teste de Volume (Fetch All)
    console.log("\n🧪 Teste 1: Volume Total (/api/users)");
    try {
        const r = await fetch(`${ID_CONTROL_URL}/api/users`, { headers });
        if (r.ok) {
            const d = await r.json();
            const arr = Array.isArray(d) ? d : (d.content || []);
            console.log(`   📊 Total de usuários retornados: ${arr.length}`);
            if (arr.length > 0) console.log("   Exemplo ID[0]:", arr[0].id);
        } else {
            console.log(`   ❌ Erro ao listar: ${r.status}`);
        }
    } catch (e) { console.log(e.message); }

    // 3. Teste de Busca Direta (Várias Estratégias)
    // Precisamos encontrar como filtrar server-side
    const tests = [
        { method: "GET", url: `/api/users?rg=${TARGET_RG}` },
        { method: "GET", url: `/api/users?document=${TARGET_RG}` },
        { method: "GET", url: `/api/users?name=${TARGET_NAME}` }, // Busca por nome
        { method: "GET", url: `/api/users/search?q=${TARGET_RG}` },
        { method: "POST", url: `/api/users/search`, body: { rg: TARGET_RG } },
        { method: "POST", url: `/api/users/filter`, body: { field: "rg", value: TARGET_RG } },
        { method: "POST", url: `/api/users/query`, body: { filter: `rg eq '${TARGET_RG}'` } },

        // Estrategias comuns iDSecure / Frameworks
        { method: "POST", url: `/api/util/load/Users`, body: { where: { rg: TARGET_RG } } },
    ];

    console.log("\n🧪 Teste 2: Buscas Diretas");
    for (const t of tests) {
        try {
            const opts = { method: t.method, headers };
            if (t.body) opts.body = JSON.stringify(t.body);

            // console.log(`   👉 Tentando: ${t.method} ${t.url}`);
            const r = await fetch(`${ID_CONTROL_URL}${t.url}`, opts);

            if (r.ok) {
                const text = await r.text();
                // Verifica se retornou algo útil (não HTML ou erro mascarado)
                if (text.startsWith("{") || text.startsWith("[")) {
                    const json = JSON.parse(text);
                    const arr = Array.isArray(json) ? json : (json.content || [json]);
                    if (arr.length > 0 && !arr[0].error) {
                        console.log(`   🟢 SUCESSO! ${t.method} ${t.url} -> Encontrou ${arr.length} itens.`);
                        console.log(`      Conteúdo: ${JSON.stringify(arr[0]).substring(0, 100)}...`);
                    } else {
                        // console.log(`   ⚪ Ok (200) mas vazio ou invalido: ${t.url}`);
                    }
                }
            } else {
                if (r.status !== 404) console.log(`   🔴 Erro ${r.status} em ${t.url}`);
            }
        } catch (e) {
            // Ignorar erros de rede pra não poluir
        }
    }
}

run();
