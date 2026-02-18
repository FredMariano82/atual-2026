
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function login() {
    console.log("Logging in...");
    const response = await fetch(`${ID_CONTROL_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
    });
    const data = await response.json();
    console.log("Login success.");
    return data.accessToken || data.token;
}

async function listGroups() {
    try {
        const token = await login();

        // Attempt 1: GET /api/group
        console.log("Attempting GET /api/group ...");
        let response = await fetch(`${ID_CONTROL_URL}/api/group`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.log(`GET /api/group failed (${response.status}). Trying POST /api/group/list...`);
            // Attempt 2: POST /api/group/list (retry just in case)
            response = await fetch(`${ID_CONTROL_URL}/api/group/list`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({})
            });
        }

        if (!response.ok) {
            console.error("Failed to list groups:", response.status, await response.text());
            return;
        }

        const data = await response.json();
        const groups = Array.isArray(data) ? data : (data.content || []);

        console.log(`Found ${groups.length} groups.`);

        const targets = groups.filter(g =>
            g.name.toLowerCase().includes('zuge') ||
            g.name.toLowerCase().includes('compras') ||
            g.name.toLowerCase().includes('hebraica')
        );

        console.log("Target Groups Found:", JSON.stringify(targets, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

listGroups();
