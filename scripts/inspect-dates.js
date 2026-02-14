const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function check() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Ignorar erro SSL

    // Headers mínimos obrigatórios
    const headers = {
        "authorization": `Bearer ${TOKEN}`,
        "referer": "https://192.168.100.20:30443/",
        "user-agent": "Mozilla/5.0"
    };

    try {
        const resp = await fetch(`${ID_CONTROL_URL}/api/user/10023165`, { headers });
        const data = await resp.json();
        console.log("DATES_DEBUG:", JSON.stringify({
            name: data.name,
            begin: data.beginDate,
            end: data.endDate,
            registration: data.registration
        }));
    } catch (e) {
        console.log("ERROR:", e.message);
    }
}
check();
