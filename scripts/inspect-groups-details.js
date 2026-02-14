// 🕵️ Script Tira-Teima dos Grupos
// Executar: node scripts/inspect-groups-details.js

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspect() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // Vamos pegar o usuário Abilia e olhar DENTRO de "groupsList"
    // Lá deve ter o nome do grupo 1023 e 2000
    const url = `${ID_CONTROL_URL}/api/user/10023165`;

    const headers = {
        "authorization": `Bearer ${TOKEN}`,
        "referer": "https://192.168.100.20:30443/",
        "content-type": "application/json"
    };

    try {
        const resp = await fetch(url, { headers });
        const data = await resp.json();

        console.log("🔍 Analisando Grupos da Abilia:");
        console.log("Campo 'groups':", JSON.stringify(data.groups));

        if (data.groupsList) {
            console.log("\n📦 Detalhes em 'groupsList':");
            data.groupsList.forEach(g => {
                console.log(`   - ID: ${g.id} | Nome: "${g.name}" | Tipo: "${g.type || 'N/A'}"`);
            });
        }

        // Verificar se visitorCompany tem algo agora (só por desencargo)
        console.log(`\n🏢 Campo 'visitorCompany':`, data.visitorCompany);

    } catch (e) {
        console.log("Erro:", e.message);
    }
}

inspect();
