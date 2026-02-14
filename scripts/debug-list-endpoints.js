
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
    const headers = { "Authorization": `Bearer ${token}` };

    const endpoints = [
        { u: "/api/users", m: "GET" },
        { u: "/api/user", m: "GET" }, // Alguns sistemas usam singular para listar
        { u: "/api/users/list", m: "GET" },
        { u: "/api/users/list", m: "POST", b: {} }, // iDSecure as vezes usa POST para listar/filtrar
        { u: "/api/user/list", m: "POST", b: {} },
        { u: "/api/users/getAll", m: "GET" },
        { u: "/api/users/search", m: "POST", b: { q: "" } },
        { u: "/api/search/users", m: "POST", b: { q: "" } }
    ];

    console.log("\n🧪 Testando Endpoints de Listagem:");

    for (const e of endpoints) {
        try {
            const opts = { method: e.m, headers: { ...headers } };
            if (e.b) {
                opts.headers["Content-Type"] = "application/json";
                opts.body = JSON.stringify(e.b);
            }

            const r = await fetch(`${ID_CONTROL_URL}${e.u}`, opts);
            console.log(`   ${e.m} ${e.u} -> Status ${r.status}`);

            if (r.ok) {
                const text = await r.text();
                // Tenta parsear JSON
                try {
                    const json = JSON.parse(text);
                    const arr = Array.isArray(json) ? json : (json.content || json.data || []);
                    const isArr = Array.isArray(arr);
                    const msg = `      ✅ JSON Válido. Array? ${isArr}. Tamanho aprox: ${isArr ? arr.length : '?'}\n`;
                    require('fs').appendFileSync('probe_results_v2.txt', `[${e.m}] ${e.u} -> ${r.status}\n${msg}`);
                    if (isArr && arr.length > 0) {
                        require('fs').appendFileSync('probe_results_v2.txt', "      🎯 ACHAMOS! Exemplo: " + JSON.stringify(arr[0]).substring(0, 100) + "\n");
                        // Saving full dump for analysis
                        require('fs').writeFileSync('users_dump_full_probe.json', JSON.stringify(arr, null, 2));
                        console.log(`      💾 Dump completo salvo em users_dump_full_probe.json (${arr.length} itens)`);
                    }
                } catch (errJson) {
                    require('fs').appendFileSync('probe_results_v2.txt', `[${e.m}] ${e.u} -> ${r.status} (OK mas não JSON)\n`);
                }
            } else {
                require('fs').appendFileSync('probe_results_v2.txt', `[${e.m}] ${e.u} -> ${r.status}\n`);
            }
        } catch (err) {
            require('fs').appendFileSync('probe_results_v2.txt', `[${e.m}] ${e.u} -> ERRO: ${err.message}\n`);
        }
    }
}

run();
