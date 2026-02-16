
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function formatIdControlDate(dateStr, isStart) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
    const time = "00:00"; // HH:mm
    return `${day}/${month}/${year} ${time}`;
}

async function syncNewRecord() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    console.log("🚀 Iniciando Sync do Novo Cadastro (F12 Fields)...");

    // 1. LOGIN ID CONTROL
    let sessionToken;
    try {
        const respLogin = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        const dataLogin = await respLogin.json();
        sessionToken = dataLogin.accessToken || dataLogin.token;
        console.log("✅ ID Control Login OK.");
    } catch (e) { console.error("❌ Falha login ID Control"); return; }

    const headers = {
        "Authorization": `Bearer ${sessionToken}`,
        "Content-Type": "application/json;charset=UTF-8"
    };

    // 2. BUSCAR ÚLTIMO PRESTADOR NO SUPABASE
    const { data: prestadores } = await supabase
        .from('prestadores')
        .select('id, nome, documento, solicitacao_id')
        .order('id', { ascending: false })
        .limit(1);

    if (!prestadores?.length) return;
    const p = prestadores[0];
    console.log(`🆕 Processando: ${p.nome} (${p.documento})`);

    // 3. BUSCAR SOLICITAÇÃO (DATAS)
    const { data: sol } = await supabase
        .from('solicitacoes')
        .select('*')
        .eq('id', p.solicitacao_id)
        .single();

    if (!sol) { console.error("❌ Solicitação não encontrada."); return; }

    // 4. PREPARAR PAYLOAD IDÊNTICO AO F12
    // Formatar datas: DD/MM/YYYY HH:mm
    const shelfStart = formatIdControlDate(sol.data_inicial, true);
    const shelfEnd = formatIdControlDate(sol.data_final, false);

    console.log(`📅 Datas Formatadas: Início=[${shelfStart}] Fim=[${shelfEnd}]`);

    const payload = {
        name: p.nome,
        rg: p.documento.replace(/[^0-9]/g, ""),
        document: `RG: ${p.documento.replace(/[^0-9]/g, "")}`,

        // CAMPOS DO F12 QUE FUNCIONAM
        shelfStartLife: shelfStart,
        shelfLife: shelfEnd,
        shelfStartLifeDate: shelfStart.split(' ')[0], // Apenas data
        shelfLifeDate: shelfEnd.split(' ')[0],       // Apenas data

        // Campos obrigatórios padrão
        customFields: {},
        templates: [],
        cards: [],
        groups: [],
        userGroupsList: [],
        deleted: false,
        inativo: false
    };

    // 5. TENTAR CRIAR (POST)
    // O endpoint user/ pode ser PUT ou POST?
    // Vamos tentar POST primeiro, pois é novo.
    const url = `${ID_CONTROL_URL}/api/user/`;
    console.log(`📤 Enviando POST para ${url}...`);

    try {
        const resp = await fetch(url, {
            method: "POST", // Tentando POST para criar
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (resp.ok) {
            console.log(`✅ CRIADO COM SUCESSO! Status ${resp.status}`);
            console.log("   Retorno:", await resp.text());
        } else {
            console.log(`⚠️ Falha no POST: ${resp.status}`);
            const errText = await resp.text();
            console.log("   Erro:", errText);

            // Se der erro de "já existe" ou 405 Method Not Allowed, tentar PUT
            // Mas para PUT precisamos do ID... 
            // Vamos tentar descobrir o ID pelo nome se falhar
        }
    } catch (e) {
        console.log(`❌ Erro requisição: ${e.message}`);
    }
}

syncNewRecord();
