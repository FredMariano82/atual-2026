
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function fixMarcusCurlV4() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 FIX SUPER FINAL V4 - Tentativas de Data...");

    // 1. LOGIN
    let sessionToken;
    try {
        const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const dataLogin = await respLogin.json();
        sessionToken = dataLogin.accessToken || dataLogin.token;
    } catch (e) { console.error("Falha login"); return; }

    const headers = {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json;charset=UTF-8"
    };

    // BASE PAYLOAD
    const basePayload = {
        "Ativacao": "", "Validade": "", "admin": false, "admissao": null, "admissionDate": "",
        "bairro": null, "barras": null, "blackList": false, "bornDate": "", "canUseFacial": false,
        "cards": [], "cargo": null, "cep": null, "cidade": null, "comments": "FIX V4",
        "contingency": false, "cpf": null, "dataLastLog": null, "dateLimit": null, "dateStartLimit": null,
        "deleted": false, "document": "RG: 123456", "dtAdmissao": "", "dtNascimento": "",
        "email": null, "emailAcesso": null, "endereco": null, "estadoCivil": null, "expireOnDateLimit": false,
        "foto": null, "fotoDoc": null, "groups": [], "groupsList": [],
        "id": 10023166, "idArea": 0, "idDevice": "10023166", "idResponsavel": null, "idType": 0, "inativo": false,
        "mae": null, "nacionalidade": null, "name": "Marcus Marcus Marcus", "nascimento": null,
        "naturalidade": null, "objectGuid": null, "pai": null, "password": "", "phone": null,
        "credits": [], "rulesList": [], "password_confirmation": "", "customFields": {}
    };

    const variations = [
        // A. String exata do curl (escapando barras)
        { val: "\\/Date(1771049481000-0300)\\/", name: "Escaped String" },
        // B. String sem escape
        { val: "/Date(1771049481000-0300)/", name: "Normal String" },
        // C. Apenas números
        { val: 1771049481000, name: "Numeric Timestamp" }
    ];

    for (const v of variations) {
        console.log(`\n🔄 Tentando format: ${v.name}`);
        const p = { ...basePayload, "timeOfRegistration": v.val };

        try {
            const resp = await fetch(`${ID_CONTROL_URL}/api/user/`, {
                method: "PUT", headers, body: JSON.stringify(p)
            });

            if (resp.ok) {
                console.log(`✅ SUCESSO! Status ${resp.status}`);
                console.log("   Retorno:", await resp.text());
                return;
            } else {
                console.log(`❌ Falha: ${resp.status}`);
            }
        } catch (e) { console.log(`Erro: ${e.message}`); }
    }
}

fixMarcusCurlV4();
