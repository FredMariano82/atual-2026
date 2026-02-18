
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const fs = require('fs');

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

function log(msg) {
    console.log(msg);
    fs.appendFileSync('probe_log.txt', typeof msg === 'string' ? msg : JSON.stringify(msg) + '\n');
}

async function run() {
    log("🔐 Autenticando...");
    const loginResp = await fetch(`${ID_CONTROL_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });

    if (!loginResp.ok) return log("Erro login");
    const logData = await loginResp.json();
    const token = logData.accessToken || logData.token;

    const endpoints = [
        { method: "POST", url: "/api/user/list", body: { active: true } },
        { method: "POST", url: "/api/user/list", body: { deleted: false } },
        { method: "POST", url: "/api/user/list", body: { "search": "" } },
        { method: "POST", url: "/api/user/list", body: { "pagination": { "page": 0, "size": 10 } } },
        { method: "POST", url: "/api/user/search", body: {} },
        { method: "POST", url: "/api/users/search", body: {} },
        { method: "GET", url: "/api/user?size=10" },
        { method: "GET", url: "/api/users?size=10" },
        { method: "GET", url: "/api/util/getAllUndeletedIds/Users" },
        { method: "POST", url: "/api/util/load", body: { entity: "Users", ids: [10023165] } }
    ];

    for (const ep of endpoints) {
        log(`\nTesting ${ep.method} ${ep.url}... Body: ${JSON.stringify(ep.body)}`);
        try {
            const opts = {
                method: ep.method,
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            };
            if (ep.body) opts.body = JSON.stringify(ep.body);

            const r = await fetch(`${ID_CONTROL_URL}${ep.url}`, opts);
            log(`Status: ${r.status}`);
            if (r.ok) {
                const text = await r.text();
                try {
                    const json = JSON.parse(text);
                    const list = Array.isArray(json) ? json : (json.content || []);
                    log(`Length: ${list.length}`);
                    if (list.length > 0) log("Sample: " + JSON.stringify(list[0]).substring(0, 100));
                } catch {
                    log("Response not JSON: " + text.substring(0, 50));
                }
            } else {
                const text = await r.text();
                log("Response Error: " + text.substring(0, 100));
            }
        } catch (e) {
            log("Error: " + e.message);
        }
    }
}

run();
