// 🕵️ Script de Inspeção de Usuário ID Control (Versão 12 - Endpoint "Users" Case-Sensitive)
// Executar: node scripts/inspect-id-control-v12.js 

require('dotenv').config({ path: '.env.local' });

const ID_CONTROL_URL = "https://192.168.100.20:30443";
// Usando o token Bearer válido fornecido anteriormente
const TOKEN = process.env.ID_CONTROL_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRVc2VyVHlwZSI6IjQiLCJjaWRVc2VyTmFtZSI6Ik1hcmlhbm8iLCJjaWRVc2VySWQiOiI0MyIsImlzcyI6IkdlcmVuY2lhZG9yIGlEQWNjZXNzIiwiZXhwIjoxNzcxMTIwNTE3LCJuYmYiOjE3NzEwMzQxMTd9.xidRiZFGS3Tu9743e01OaPSvnEfZfAO4Zp21N74zeec";

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // O print mostra "Users" na coluna Nome.
    // Navegadores mostram o último segmento da URL.
    // Isso sugere que a URL termina em "/Users" (Case Sensitive!)

    // Hipóteses de URL Completa:
    const endpoints = [
        "/api/Users",
        "/Users",
        "/api/sec/Users",
        "/api/v1/Users",
        "/api/util/Users"
    ];

    const headers = {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
        "Accept": "application/json, text/plain, */*"
    };

    console.log(`🔍 Testando endpoint "Users" (Case Sensitive)...`);

    for (const ep of endpoints) {
        try {
            console.log(`   GET ${ep}...`);
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });

            if (resp.ok) {
                console.log(`   ✅ SUCESSO EM ${ep}! (Status ${resp.status})`);
                const text = await resp.text();

                try {
                    const data = JSON.parse(text);
                    console.log(`   📦 Tipo retorno: ${Array.isArray(data) ? "Array" : typeof data}`);

                    // Se for array grande, pegar o usuario Abilia
                    let lista = [];
                    if (Array.isArray(data)) lista = data;
                    else if (data.content) lista = data.content;
                    else if (data.users) lista = data.users;

                    if (lista.length > 0) {
                        console.log(`   📋 Total itens: ${lista.length}`);
                        const alvo = lista.find(u => JSON.stringify(u).toLowerCase().includes("abilia"));

                        if (alvo) {
                            console.log("\n=============================================");
                            console.log(`📄 DADOS DE: Abilia`);
                            console.log("=============================================\n");
                            console.log(JSON.stringify(alvo, null, 2));
                        } else {
                            console.log("\n📄 Exemplo do primeiro item (Abilia não encontrada):");
                            console.log(JSON.stringify(lista[0], null, 2).substring(0, 1000));
                        }
                    } else {
                        console.log("   ⚠️ Lista vazia ou formato desconhecido:", text.substring(0, 200));
                    }
                    return; // Sucesso
                } catch (e) {
                    console.log("   ⚠️ Retorno ok, mas erro ao processar JSON:", e.message);
                }
            } else {
                console.log(`   ❌ Status ${resp.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Erro: ${e.message}`);
        }
    }
    console.log("❌ Nenhum endpoint funcionou.");
}

inspectWithToken();
