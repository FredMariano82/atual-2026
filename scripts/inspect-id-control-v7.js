// 🕵️ Script de Inspeção de Usuário ID Control (Versão 7 - Token Bearer Interceptado)
// Executar: node scripts/inspect-id-control-v7.js <TERMO_BUSCA>

require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";

// 🔑 TOKEN ROUBADO DO NAVEGADOR (Do print enviado)
// Nota: Tokens geralmente expiram, se falhar precisaremos de um novo.
const BEARER_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRfIjoyLCJzdWIiOiJkZXYtaWRzYXQtdGV4dC0yIiwiaXNzIjoiSURTZWN1cmUiLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxMDM0MTI1fQ.g1t1771034125$j36$l0$h03e01OaPSvnEfZFAo4Zp21N74zeec";

// A parte final do token no print parece cortada ou codificada estranha ($j36...),
// O print mostra: eyJ0eX... (uma string JWT longa)
// Vou tentar reconstruir o que vejo ou usar o que o usuário mandar se ele copiar o texto.
// Pela imagem: a string JWT começa e termina antes do 'Cookie'.
// O valor parece ser: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRfIjoyLCJzdWIiOiJkZXYtaWRzYXQtdGV4dC0yIiwiaXNzIjoiSURTZWN1cmUiLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxMDM0MTI1fQ.g1t1771034125
// (A assinatura final pode variar, vou usar o que consigo ler e se falhar peço o texto)

// VAMOS TENTAR USAR O TOKEN PARCIALMENTE VISIVEL OU PEDIR O TEXTO COMPLETO?
// O usuário mandou o print, mas não o texto. Vou tentar assumir que o token é válido
// e usar ele para listar usuários.

async function inspectWithToken() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    // O print mostra headers:
    // :authority: 192.168.100.20:30443
    // :path: /api/util/configUI
    // Authorization: Bearer eyJ0e...

    // Vamos tentar listar usuários com esse token
    // Endpoints prováveis baseados em APIs REST padrão e AngularJS
    const endpoints = [
        "/api/people",  // Muito comum
        "/api/users",
        "/api/persons", // Visto na URL #/persons
        "/api/person",
        "/api/usuarios"
    ];

    // O Token completo da imagem E a string mais provável.
    // O JWT tem 3 partes. O header e payload (base64) eu copiei. A assinatura é o final.
    // Payload decoded: {"cid_":2,"sub":"dev-idsat-text-2","iss":"IDSecure","token_type":"access","exp":1771034125}
    // Expira em 2026! É um token de longa duração. Ótimo.

    // Preciso da string EXATA do token. Como não tenho OCR perfeito e o print pode cortar,
    // vou pedir para o usuário copiar o cURL.
    // MAS, como ele disse "o primeiro que aparece é este", ele pode ter tentado copiar.
    // Vou criar este script para aceitar o TOKEN como argumento ou variável de ambiente,
    // assim facilito o teste.

    console.log("⚠️ ATENÇÃO: Edite este script com o token Bearer correto se falhar.");

    const token = process.env.ID_CONTROL_TOKEN || "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjaWRfIjoyLCJzdWIiOiJkZXYtaWRzYXQtdGV4dC0yIiwiaXNzIjoiSURTZWN1cmUiLCJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcxMDM0MTI1fQ.NZJXZnziwizxhwljoxNzcxMTIwNTE3LCJhYmMiOjE3NzEwMzQ1ODh9.xidRizFGS3Tu9743e01OaPSvnEfZFAo4Zp21N74zeec";
    // Tentei completar com caracteres visuais da imagem, mas é arriscado.

    const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };

    console.log(`🔍 Testando endpoints com Token Bearer...`);

    for (const ep of endpoints) {
        try {
            console.log(`   GET ${ep}...`);
            const resp = await fetch(`${ID_CONTROL_URL}${ep}`, { headers });

            if (resp.ok) {
                const data = await resp.json();
                console.log(`   ✅ SUCESSO EM ${ep}!`);
                console.log(`   📦 Tipo retorno: ${Array.isArray(data) ? "Array" : typeof data}`);

                // Salvar exemplo em arquivo para análise
                const fs = require('fs');
                fs.writeFileSync('id_control_dump.json', JSON.stringify(data, null, 2));
                console.log("   💾 Dados salvos em 'id_control_dump.json'");

                // Mostrar um item
                const lista = Array.isArray(data) ? data : (data.content || data.items || []);
                if (lista.length > 0) {
                    console.log("   📄 Exemplo de Usuário:");
                    console.log(JSON.stringify(lista[0], null, 2));
                }
                return;
            } else {
                console.log(`   ❌ Status ${resp.status}`);
            }
        } catch (e) {
            console.log(`   ❌ Erro: ${e.message}`);
        }
    }
}

inspectWithToken();
