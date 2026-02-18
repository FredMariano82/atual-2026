
const https = require('https');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const TARGET_URL = "https://192.168.100.20:30443/api";
const USER = "mariano";
const PASS = "hebraica";

async function run() {
    console.log(`Connecting to ${TARGET_URL}...`);

    // 1. Login
    const loginBody = {
        "username": USER,
        "password": PASS
    };

    try {
        const loginRes = await fetch(`${TARGET_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginBody)
        });

        const text = await loginRes.text();

        if (!loginRes.ok) {
            console.error("Login failed:", loginRes.status, text);
            return;
        }

        let loginData;
        try {
            loginData = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON response:", e.message);
            console.log("Raw response:", text);
            return;
        }

        // console.log("Login JSON:", JSON.stringify(loginData));
        const token = loginData.accessToken || loginData.token;

        if (!token) {
            console.error("Token (accessToken) not found in login response!");
            console.log("Available keys:", Object.keys(loginData).join(", "));
            return;
        }

        console.log("Logged in. Token:", token.substring(0, 10) + "...");

        // 2. Fetch Users (POST /api/user/list)
        console.log("Fetching users list...");
        const res = await fetch(`${TARGET_URL}/user/list`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        });

        const listData = await res.json();

        let users = [];
        if (Array.isArray(listData)) {
            users = listData;
        } else if (listData.content && Array.isArray(listData.content)) {
            users = listData.content;
        } else if (listData.data && Array.isArray(listData.data)) {
            users = listData.data;
        } else {
            console.log("Unknown list format:", Object.keys(listData).join(", "));
        }

        console.log(` fetched ${users.length} users.`);

        // Search for RG 56996
        const targetRG = "56996";
        const found = users.find(u => {
            const rg = (u.registration || "").replace(/[^a-zA-Z0-9]/g, "");
            return rg === targetRG;
        });

        if (found) {
            console.log("✅ FOUND USER!");
            console.log(JSON.stringify(found, null, 2));
        } else {
            console.log(`❌ User RG ${targetRG} NOT found in the list of ${users.length} users.`);
            // Maybe print some examples to check format
            if (users.length > 0) {
                console.log("Example RG from first user:", users[0].registration);
            }
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
}

run();
