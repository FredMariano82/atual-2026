// 🕵️ Script de Mapeamento Completo (Campos Padrão + Customizados) -> Arquivo
// Executar: node scripts/map-all-fields-to-file.js

require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

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

    let output = "🔍 Mapeamento de Campos do ID Control\n\n";

    // 1. Campos do Objeto Usuário (Padrão)
    try {
        const resp = await fetch(`${ID_CONTROL_URL}/api/user/${USER_ID}`, { headers });
        const data = await resp.json();

        output += "🟢 CAMPOS PADRÃO (Disponíveis no cadastro):\n";
        Object.keys(data).sort().forEach(key => { // Ordem alfabética
            let val = data[key];
            let tipo = typeof val;
            if (val === null) tipo = "null";
            else if (Array.isArray(val)) tipo = `Array[${val.length}]`;

            let exemplo = JSON.stringify(val);
            if (exemplo && exemplo.length > 50) exemplo = exemplo.substring(0, 50) + "...";

            output += `   - ${key} (${tipo}): ${exemplo}\n`;
        });

    } catch (e) {
        output += `❌ Erro ao ler campos padrão: ${e.message}\n`;
    }

    output += "\n";

    // 2. Campos Customizados
    try {
        const urlCustom = `${ID_CONTROL_URL}/api/customfield?id=${USER_ID}`;
        const respCustom = await fetch(urlCustom, { headers });
        if (respCustom.ok) {
            const dataCustom = await respCustom.json();
            output += "🟣 CAMPOS CUSTOMIZADOS (Extras):\n";

            // Tentar descobrir estrutura do retorno de customfield
            // Pode ser array de objetos {id, name, value}
            if (Array.isArray(dataCustom) && dataCustom.length > 0) {
                dataCustom.forEach(field => {
                    output += `   - [${field.id}] ${field.name || field.label}: ${field.value}\n`;
                });
            } else if (Object.keys(dataCustom).length > 0) {
                output += JSON.stringify(dataCustom, null, 2) + "\n";
            } else {
                output += "   (Nenhum campo customizado encontrado)\n";
            }
        }
    } catch (e) {
        output += `⚠️ Erro ao buscar custom fields: ${e.message}\n`;
    }

    fs.writeFileSync('campos_id_control.txt', output, 'utf8');
    console.log("✅ Arquivo campos_id_control.txt gerado com sucesso.");
}

mapFields();
