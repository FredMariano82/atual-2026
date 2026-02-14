// 🕵️ Script de Inspeção de Grupos (Empresas/Deptos)
// Executar: node scripts/inspect-id-control-groups.js

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
const TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectGroups() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    const headers = {
        "authorization": `Bearer ${TOKEN}`,
        "referer": "https://192.168.100.20:30443/",
        "content-type": "application/json"
    };

    // IDs suspeitos encontrados no usuário Abilia: 1023 e 2000
    // O print mostra: "Contas a Pagar" (Depto) e "Hebraica" (Empresa)
    const targetGroups = [1023, 2000];

    console.log("🔍 Verificando se Grupos são Empresas/Departamentos...\n");

    for (const id of targetGroups) {
        try {
            // Tentar endpoint padrão de grupo
            // Hipóteses: /api/group/ID, /api/groups/ID, /api/sec/group/ID
            const urls = [
                `${ID_CONTROL_URL}/api/group/${id}`,
                `${ID_CONTROL_URL}/api/groups/${id}`,
                `${ID_CONTROL_URL}/api/companies/${id}`, // Talvez seja uma entidade separada?
                `${ID_CONTROL_URL}/api/departments/${id}`
            ];

            let found = false;
            for (const url of urls) {
                try {
                    const resp = await fetch(url, { headers });
                    if (resp.ok) {
                        const data = await resp.json();
                        console.log(`✅ ID ${id} encontrado em ${url}`);
                        console.log(`   Nome: ${data.name}`);
                        console.log(`   Tipo/Descrição: ${data.description || data.type || "N/A"}`);
                        // console.log(JSON.stringify(data, null, 2).substring(0, 200));
                        found = true;
                        break;
                    }
                } catch (e) { }
            }

            if (!found) console.log(`❌ ID ${id} não encontrado nos endpoints comuns.`);

        } catch (e) {
            console.log(`❌ Erro geral ID ${id}: ${e.message}`);
        }
    }
}

inspectGroups();
