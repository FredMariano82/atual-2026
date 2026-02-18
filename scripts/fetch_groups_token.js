
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxNDQ5NjM2LCJuYmYiOjE3NzEzNjMyMzZ9.LOQTGUfX3gQJUaThcwhMY91FSrPdGzbH3-TEUAhL9uU";

async function listGroups() {
    try {
        console.log("Attempting GET /api/group with user token...");
        const response = await fetch(`${ID_CONTROL_URL}/api/group`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json",
                "Cookie": "_ga=GA1.1.1723055842.1746807528; _gid=GA1.1.750159494.1771363227; _ga_LKR555MZDX=GS2.1.s1771365837$o188$g0$t1771365894$j3$l0$h0"
            }
        });

        if (!response.ok) {
            console.error("Failed:", response.status, await response.text());
            return;
        }

        const data = await response.json();
        const groups = Array.isArray(data) ? data : (data.content || []);

        console.log(`Found ${groups.length} groups.`);
        require('fs').writeFileSync('dump_grupos_full.json', JSON.stringify(groups, null, 2));
        console.log("Groups saved to dump_grupos_full.json");

        // Show sample of target groups
        const targets = groups.filter(g =>
            g.name.toLowerCase().includes('zuge') ||
            g.name.toLowerCase().includes('compras') ||
            g.name.toLowerCase().includes('hebraica')
        );
        console.log("Targets found:", JSON.stringify(targets, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

listGroups();
