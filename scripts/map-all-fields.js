// 🕵️ Script de Mapeamento Completo (Campos Padrão + Customizados)
// Executar: node scripts/map-all-fields.js

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";
const USER_ID = 10023165; // Abilia

async function mapFields() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const headers = {
        "authorization": `Bearer ${TOKEN}`,
        "referer": "https://192.168.100.20:30443/",
        "content-type": "application/json"
    };

    console.log("🔍 Mapeando campos do ID Control...\n");

    // 1. Campos do Objeto Usuário (Padrão)
    try {
        const resp = await fetch(`${ID_CONTROL_URL}/api/user/${USER_ID}`, { headers });
        const data = await resp.json();

        console.log("🟢 CAMPOS PADRÃO (Disponíveis no cadastro):");
        Object.keys(data).forEach(key => {
            let val = data[key];
            let tipo = typeof val;
            if (val === null) tipo = "null";
            else if (Array.isArray(val)) tipo = `Array[${val.length}]`;

            // Exibir valor de exemplo para facilitar identificação
            let exemplo = JSON.stringify(val);
            if (exemplo && exemplo.length > 50) exemplo = exemplo.substring(0, 50) + "...";

            console.log(`   - ${key} (${tipo}): ${exemplo}`);
        });

    } catch (e) {
        console.log("❌ Erro ao ler campos padrão:", e.message);
    }

    // 2. Campos Customizados (Observado no Network: customfield?id=...)
    try {
        // A URL no print era: customfield?id=10023165&language=...
        // Vamos tentar descobrir o endpoint correto. Provavelmente /api/customfield
        const urlCustom = `${ID_CONTROL_URL}/api/customfield?id=${USER_ID}`;

        const respCustom = await fetch(urlCustom, { headers });
        if (respCustom.ok) {
            const dataCustom = await respCustom.json();
            console.log("\n🟣 CAMPOS CUSTOMIZADOS (Extras):");
            if (Array.isArray(dataCustom) && dataCustom.length > 0) {
                dataCustom.forEach(field => {
                    console.log(`   - [${field.id}] ${field.name || field.label}: ${field.value}`);
                });
            } else if (Object.keys(dataCustom).length > 0) {
                console.log(JSON.stringify(dataCustom, null, 2));
            } else {
                console.log("   (Nenhum campo customizado preenchido ou encontrado)");
            }
        } else {
            // console.log(`\n⚠️ Endpoint de customfield retornou status ${respCustom.status}`);
        }

    } catch (e) {
        // console.log("⚠️ Erro ao buscar custom fields:", e.message);
    }
}

mapFields();
