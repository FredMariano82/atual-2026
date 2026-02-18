
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxNDQ5NjM2LCJuYmYiOjE3NzEzNjMyMzZ9.LOQTGUfX3gQJUaThcwhMY91FSrPdGzbH3-TEUAhL9uU";

async function listGroups() {
    try {
        console.log("Attempting POST /api/group/list with user token...");
        const response = await fetch(`${ID_CONTROL_URL}/api/group/list`, {
            method: "POST", // Changed to POST
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
                // Mimic headers exactly
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\""
            },
            body: JSON.stringify({}) // Empty body was used in my initial script, trying that again as user trace showed 'group/' not 'group/list' but maybe 'group/list' works better for bulk.
            // Wait, user trace showed 'group/' as GET returning 125kB. My previous GET failed returning []. 
            // Maybe it needs parameters? Or maybe my token copy is wrong? 
            // Let's try GET again but with exact headers from cURL.
        });

        if (!response.ok) {
            console.error("Failed:", response.status, await response.text());
        } else {
            const data = await response.json();
            const groups = Array.isArray(data) ? data : (data.content || []);
            console.log(`POST /api/group/list: Found ${groups.length} groups.`);
            if (groups.length > 0) require('fs').writeFileSync('dump_grupos_full.json', JSON.stringify(groups, null, 2));
        }

        console.log("Attempting GET /api/group with EXACT headers...");
        const responseGet = await fetch(`${ID_CONTROL_URL}/api/group/`, { // Note trailing slash
            method: "GET",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
                "accept": "application/json, text/plain, */*",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
                "sec-ch-ua": "\"Not(A:Brand\";v=\"8\", \"Chromium\";v=\"144\", \"Google Chrome\";v=\"144\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\""
            }
        });

        if (!responseGet.ok) {
            console.error("GET Failed:", responseGet.status, await responseGet.text());
        } else {
            const data = await responseGet.json();
            const groups = Array.isArray(data) ? data : (data.content || []);
            console.log(`GET /api/group/: Found ${groups.length} groups.`);
            if (groups.length > 0) require('fs').writeFileSync('dump_grupos_full_get.json', JSON.stringify(groups, null, 2));
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

listGroups();
