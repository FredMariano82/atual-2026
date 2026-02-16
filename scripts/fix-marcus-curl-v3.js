
require('dotenv').config({ path: '.env.local' });

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

async function fixMarcusCurlV3() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 FIX SUPER FINAL V3 - Ajuste de Formato de Data...");

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

    // PAYLOAD COM DATA FORMATADA (Tentando sem fuso ou null se falhar)
    const payload = {
        "Ativacao": "",
        "Validade": "",
        "admin": false,
        "admissao": null,
        "admissionDate": "",
        "allowParkingSpotCompany": null,
        "availableCompanies": null,
        "availableGroupsVisitorsList": null,
        "availableResponsibles": null,
        "bairro": null,
        "barras": null,
        "blackList": false,
        "bornDate": "",
        "canUseFacial": false,
        "cards": [],
        "cargo": null,
        "cep": null,
        "cidade": null,
        "comments": "checagem válida até 14/08/2026",
        "contingency": false,
        "cpf": null,
        "dataLastLog": null,
        "dateLimit": null,
        "dateStartLimit": null,
        "deleted": false,
        "document": "RG: 123456",
        "dtAdmissao": "",
        "dtNascimento": "",
        "email": null,
        "emailAcesso": null,
        "endereco": null,
        "estadoCivil": null,
        "expireOnDateLimit": false,
        "foto": null,
        "fotoDoc": null,
        "groups": [],
        "groupsList": [],
        "id": 10023166,
        "idArea": 0,
        "idDevice": "10023166",
        "idResponsavel": null,
        "idType": 0,
        "inativo": false,
        "mae": null,
        "nacionalidade": null,
        "name": "Marcus Marcus Marcus",
        "nascimento": null,
        "naturalidade": null,
        "objectGuid": null,
        "pai": null,
        "password": "",
        "phone": null,
        "photoDeleted": null,
        "photoIdFaceState": null,
        "photoTimestamp": null,
        "pis": 0,
        "pisAnterior": 0,
        "ramal": null,
        "registration": "",
        "responsavelNome": null,
        "rg": "123456",
        "selectedGroupsVisitorsList": null,
        "selectedIdGroupsVisitorsList": null,
        "selectedIdResponsible": null,
        "selectedIdVisitedCompany": null,
        "selectedNameResponsible": null,
        "selectedResponsible": null,
        "selectedVisitedCompany": null,
        "senha": 0,
        "sexo": null,
        "shelfLife": null,
        "shelfStartLife": null,
        "telefone": null,
        "templates": [],
        "templatesImages": [],
        "templatesList": [],
        "templatesPanic": [],
        "templatesPanicImages": [],
        "templatesPanicList": [],
        // TENTATIVA 1: Enviando NULL para ver se passa (o servidor pode gerar)
        // "timeOfRegistration": "/Date(1771049481000)/", 
        "timeOfRegistration": null,
        "userGroupsList": [],
        "veiculo_cor": null,
        "veiculo_marca": null,
        "veiculo_modelo": null,
        "veiculo_placa": null,
        "visitorCompany": null,
        "credits": [],
        "rulesList": [],
        "password_confirmation": "",
        "customFields": {}
    };

    console.log("📤 Enviando Payload Corrigido V3 (timeOfRegistration=null)...");

    try {
        const url = `${ID_CONTROL_URL}/api/user/`;

        const resp = await fetch(url, {
            method: "PUT",
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            console.log(`✅ SUCESSO! Status ${resp.status}`);
            console.log("   Retorno:", await resp.text());
        } else {
            console.log(`❌ Falha: ${resp.status}`);
            console.log("   Erro:", await resp.text());
        }
    } catch (e) {
        console.log(`❌ Erro requisição: ${e.message}`);
    }
}

fixMarcusCurlV3();
