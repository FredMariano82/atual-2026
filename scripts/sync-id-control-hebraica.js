
// 🔄 Sincronizador ID Control - Perfil HEBRAICA (Smart Sync)
// Executar: node scripts/sync-id-control-hebraica.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Ignorar erro SSL globalmente

// ==========================================
// ⚙️ CONFIGURAÇÕES
// ==========================================
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

// Inicializar Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let sessionToken = null;

// ==========================================
// 🛠️ HELPERS
// ==========================================

function toIdControlDate(dateString) {
    if (!dateString) return null;
    // Criar data ao meio-dia para evitar problemas de fuso
    const date = new Date(dateString + 'T12:00:00');
    // Adicionar offset fixo de -0300 para garantir compatibilidade com o formato visto no dump
    return `/Date(${date.getTime()}-0300)/`;
}

function formatDateBr(dateString) {
    if (!dateString) return "";
    const [ano, mes, dia] = dateString.split("-");
    return `${dia}/${mes}/${ano}`;
}

// ==========================================
// 🔌 API ID CONTROL
// ==========================================

async function loginIdControl() {
    try {
        console.log("🔐 Autenticando no ID Control...");
        const response = await fetch(`${ID_CONTROL_URL}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });

        if (!response.ok) throw new Error(`Login falhou: ${response.status}`);
        const data = await response.json();
        sessionToken = data.accessToken || data.token;
        console.log("✅ Login realizado!");
        return true;
    } catch (e) {
        console.error("❌ Erro no login:", e.message);
        return false;
    }
}

async function fetchAllUsers() {
    try {
        console.log("   📥 Baixando lista completa de usuários (POST /api/user/list)...");
        // Endpoint correto descoberto via probe (POST com body vazio)
        const r = await fetch(`${ID_CONTROL_URL}/api/user/list`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${sessionToken}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({})
        });
        if (r.ok) {
            const d = await r.json();
            const lista = Array.isArray(d) ? d : (d.content || []);
            console.log(`   📦 Lista carregada: ${lista.length} usuários.`);
            return lista;
        } else {
            console.error(`   ❌ Erro ${r.status} ao baixar lista.`);
        }
    } catch (e) { console.error("   ❌ Erro request lista:", e.message); }
    return [];
}

async function updateUser(id, payload) {
    try {
        const response = await fetch(`${ID_CONTROL_URL}/api/user/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Erro ${response.status}: ${txt}`);
        }
        return true;
    } catch (e) {
        console.error("❌ Erro update:", e.message);
        return false;
    }
}

async function createUser(payload) {
    try {
        const response = await fetch(`${ID_CONTROL_URL}/api/user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${sessionToken}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const txt = await response.text();
            throw new Error(`Erro ${response.status}: ${txt}`);
        }

        const data = await response.json();
        return data.id || data;
    } catch (e) {
        throw e;
    }
}

// ==========================================
// 🚀 LÓGICA DE SINCRONIZAÇÃO OTIMIZADA (Smart Sync)
// ==========================================

async function syncHebraica() {
    console.log("\n🚀 INICIANDO SINCRONIZAÇÃO HEBRAICA (Smart Sync)...\n");

    // 1. Buscar prestadores (Limitado: 5 por vez)
    const { data: prestadores, error } = await supabase
        .from('prestadores')
        .select(`
            id, nome, documento, status, empresa, checagem_valida_ate,
            id_control_id, integrado_id_control,
            solicitacoes ( data_inicial, data_final )
        `)
        .eq('empresa', 'Hebraica')
        .eq('status', 'aprovado')
        .order('updated_at', { ascending: false })
        .limit(10);

    if (error || !prestadores || prestadores.length === 0) {
        console.log("💤 Nada para processar.");
        return;
    }

    console.log(`📋 Processando ${prestadores.length} prestadores...`);

    if (!await loginIdControl()) return;

    // Cache de usuários remotos (Só baixamos se necessário)
    let remoteUsersCache = null;

    for (const p of prestadores) {
        console.log(`\n🔍 Prestador: ${p.nome} (Doc: ${p.documento})`);

        let idRemoto = p.id_control_id;

        // A. TENTATIVA DIRETA (Via ID armazenado no Supabase)
        if (idRemoto) {
            console.log(`   ⚡ ID Local já vinculado: ${idRemoto}. Atualizando...`);
            await processarUpdate(p, idRemoto);
            continue;
        }

        // B. BUSCA NA LISTA (Se não tem ID local, procura no ID Control)
        console.log("   🤷‍♂️ Sem vínculo local. Buscando no ID Control...");

        if (!remoteUsersCache) {
            remoteUsersCache = await fetchAllUsers();
        }

        const docLimpo = p.documento.replace(/[^a-zA-Z0-9]/g, "");
        const userFound = remoteUsersCache.find(u => {
            const uRg = String(u.rg || "").replace(/[^a-zA-Z0-9]/g, "");
            const uCpf = String(u.cpf || "").replace(/[^a-zA-Z0-9]/g, "");

            // Match por documento
            const docMatch = (uRg && uRg === docLimpo) || (uCpf && uCpf === docLimpo);
            if (docMatch) return true;

            // Match por Nome (Fallback para quando o RG ainda não indexou ou foi formatado estranho)
            if (u.name && p.nome && u.name.trim().toLowerCase() === p.nome.trim().toLowerCase()) {
                console.log(`   ⚠️ Match encontrado por NOME: ${u.name}`);
                return true;
            }
            return false;
        });

        if (userFound) {
            console.log(`   ✅ Encontrado na lista remota! ID: ${userFound.id}`);
            idRemoto = userFound.id;
            // 1. Vincular para o futuro
            await salvarVinculo(p.id, idRemoto);
            // 2. Atualizar dados
            await processarUpdate(p, idRemoto);
        } else {
            console.log("   🆕 Não encontrado na lista. Criando novo usuário...");
            idRemoto = await processarCreate(p);
            if (idRemoto) {
                await salvarVinculo(p.id, idRemoto);
            }
        }
    }
}

async function salvarVinculo(prestadorId, idControlId) {
    if (!idControlId) return;
    await supabase.from('prestadores').update({
        integrado_id_control: true,
        id_control_id: idControlId,
        data_integracao: new Date()
    }).eq('id', prestadorId);
    console.log("   🔗 Vínculo salvo no Supabase (Próxima vez será instantâneo!)");
}

async function processarUpdate(p, id) {
    const sol = Array.isArray(p.solicitacoes) ? p.solicitacoes[0] : p.solicitacoes;
    const validaAte = formatDateBr(p.checagem_valida_ate);

    // Payload segura para Update
    const payload = {
        name: p.nome,
        comments: validaAte ? `checagem válida até ${validaAte}` : "",
    };
    if (sol?.data_inicial) payload.dateStartLimit = toIdControlDate(sol.data_inicial);
    if (sol?.data_final) {
        payload.dateLimit = toIdControlDate(sol.data_final);
        payload.expireOnDateLimit = true; // FORÇAR O USO DA DATA LIMITE
    }

    await updateUser(id, payload);
    console.log("   💾 Usuário atualizado com sucesso.");
}

async function processarCreate(p) {
    const sol = Array.isArray(p.solicitacoes) ? p.solicitacoes[0] : p.solicitacoes;
    const validaAte = formatDateBr(p.checagem_valida_ate);

    // Payload completo para Create
    const payload = {
        name: p.nome,
        rg: p.documento.replace(/[^a-zA-Z0-9]/g, ""),
        comments: validaAte ? `checagem válida até ${validaAte}` : "",
        idArea: 1, // Default
        idType: 0  // Default
    };
    if (sol?.data_inicial) payload.dateStartLimit = toIdControlDate(sol.data_inicial);
    if (sol?.data_final) {
        payload.dateLimit = toIdControlDate(sol.data_final);
        payload.expireOnDateLimit = true;
    }

    try {
        const id = await createUser(payload);
        console.log(`   ✨ Usuário criado com sucesso! ID: ${id}`);
        return id;
    } catch (e) {
        console.error("   ❌ Erro ao criar:", e.message);
        // Log extra para debug
        require('fs').writeFileSync('create_error_last.txt', e.message + "\nPayload:\n" + JSON.stringify(payload, null, 2));
        return null;
    }
}

// Executar
syncHebraica();
