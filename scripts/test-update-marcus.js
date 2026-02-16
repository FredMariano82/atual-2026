
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function testUpdateMarcus() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Testando Atualização de Datas - Marcus...");

    let sessionToken = null;

    // 1. LOGIN
    try {
        const response = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const data = await response.json();
        sessionToken = data.accessToken || data.token;
        console.log("✅ Login OK.");
    } catch (e) {
        console.error("❌ Erro login:", e.message);
        return;
    }

    const headers = {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json"
    };

    const idMarcus = 10023166;

    // 2. PAYLOAD DE TESTE
    // Baseado na imagem e dump, os campos são quase certamente:
    // dateStartLimit: "Início da Liberação"
    // dateLimit: "Fim da Liberação"
    // expireOnDateLimit: Checkbox implícito ou explícito?

    const payload = {
        name: "Marcus Marcus Marcus",
        dateStartLimit: "14/02/2026 00:00:00",
        dateLimit: "14/07/2026 23:59:59",
        expireOnDateLimit: true
    };

    console.log(`\n📤 Payload para ID ${idMarcus}:`, payload);

    const attempts = [
        { url: `/api/users/${idMarcus}`, method: "PUT" },
        { url: `/api/users/${idMarcus}`, method: "PATCH" }, // Tentar PATCH
        { url: `/api/users/${idMarcus}`, method: "POST" },
        { url: `/api/user/${idMarcus}`, method: "PUT" },
        { url: `/api/user/${idMarcus}`, method: "POST" },
        { url: `/api/people/${idMarcus}`, method: "PUT" },
        { url: `/api/people/${idMarcus}`, method: "POST" },
        // Tentar endpoint de salvamento direto
        { url: `/api/users/save`, method: "POST" },
        { url: `/api/people/save`, method: "POST" }
    ];

    for (const att of attempts) {
        console.log(`\n🔄 Tentando ${att.method} ${att.url}...`);
        try {
            const resp = await fetch(`${ID_CONTROL_URL}${att.url}`, {
                method: att.method,
                headers: headers,
                body: JSON.stringify(payload)
            });

            if (resp.ok) {
                console.log(`✅ SUCESSO! (${att.method} ${att.url}) - Status ${resp.status}`);
                // ... rest of success handling
                return;
            } else {
                // Logar qual falhou
                console.log(`❌ Falha em ${att.method} ${att.url}: Status ${resp.status}`);
                // console.log("   Msg:", await resp.text().catch(() => '')); // Ocultar HTML gigante
            }
        } catch (e) {
            console.log(`❌ Erro requisição: ${e.message}`);
        }
    }
}

testUpdateMarcus();
