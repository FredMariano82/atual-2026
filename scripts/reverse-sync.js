// 🔄 Importação Reversa (Carga Inicial): ID Control -> Supabase
// Executar: node scripts/reverse-sync.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('reverse_sync_log.txt', msg + '\n');
}

// Configuração
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
// ⚠️ IGNORAR ERROS DE CERTIFICADO SSL (Necessário para IP local)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Helper para HTTPS Request usando native FETCH global
async function httpsRequest(method, path, body = null, token = null) {
    const url = ID_CONTROL_URL + path;
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };

    const options = {
        method: method,
        headers: headers
    };

    if (body) options.body = JSON.stringify(body);

    try {
        const res = await fetch(url, options);
        let data = {};
        const text = await res.text();

        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            // Se falhar parse, data fica objeto vazio mas logamos o texto se status for erro
        }

        if (!res.ok) {
            // Se status não for 2XX, adicionar texto ao objeto data para debug
            if (!data.message && text) data.message = text;
            // Ou podemos retornar o texto direto no log do caller
        }

        return { status: res.status, data: data, text: text };
    } catch (e) {
        throw e;
    }
}

// Cache de Departamentos (Nome -> ID)
let deptCache = {};
let sessionToken = "";

async function loginIdControl() {
    log("🔐 Autenticando no ID Control...");
    try {
        const res = await httpsRequest('POST', '/api/login/', {
            username: ID_CONTROL_USER,
            password: ID_CONTROL_PASS
        });

        if (res.status === 200 && (res.data.token || res.data.accessToken)) {
            log("✅ Login OK.");
            sessionToken = res.data.token || res.data.accessToken;
            return true;
        }
        log(`❌ Falha no login: ${res.status} - ${res.text ? res.text.substring(0, 200) : JSON.stringify(res.data)}`);
        return false;
    } catch (e) {
        log("❌ Erro conexão login: " + e.message);
        return false;
    }
}

// Carregar Cache de Departamentos do Supabase
async function loadDeptCache() {
    const { data } = await supabase.from('departamentos').select('id, nome');
    if (data) {
        data.forEach(d => deptCache[d.nome.toUpperCase()] = d.id);
        log(`📚 Cache de Departamentos carregado: ${Object.keys(deptCache).length} itens.`);
    }
}

// Obter ou Criar Departamento
async function getOrCreateDept(deptName) {
    if (!deptName) return null;
    const key = deptName.toUpperCase().trim();
    if (deptCache[key]) return deptCache[key];

    log(`   ✨ Criando Novo Departamento: "${deptName}"...`);
    // O erro anterior indicou que a coluna 'ativo' não existe
    const { data, error } = await supabase
        .from('departamentos')
        .insert([{ nome: deptName }]) // Removido 'ativo'
        .select()
        .single();

    if (error || !data) {
        log(`   ❌ Erro ao criar departamento "${deptName}": ${error.message || JSON.stringify(error)}`);
        return null;
    }

    deptCache[key] = data.id;
    return data.id;
}

// Converter Data do ID Control (YYYY-MM-DDTHH:mm:ss) para Date
// ...

function formatDateBr(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
}

// Parse Checagem Valida Ate from comments
function parseChecagemDate(comments) {
    if (!comments) return { date: null, cleanComments: "" }; // If empty, return consistent object

    // Regex for "checagem válida até DD/MM/YYYY" (case insensitive)
    const regex = /checagem\s+v[áa]lida\s+at[ée]\s+(\d{2}\/\d{2}\/\d{4})/i;
    const match = comments.match(regex);

    if (match && match[1]) {
        // Convert DD/MM/YYYY to YYYY-MM-DD
        const [day, month, year] = match[1].split('/');
        const isoDate = `${year}-${month}-${day}`;
        // Remove the matched validation string from comments
        const cleanComments = comments.replace(regex, "").trim();
        return { date: isoDate, cleanComments: cleanComments };
    }

    return { date: null, cleanComments: comments };
}

async function run() {
    if (!await loginIdControl()) return;
    await loadDeptCache();

    log("📥 Obtendo lista de TODOS os IDs (pode demorar)...");
    let resIds;
    try {
        resIds = await httpsRequest('GET', '/api/util/getAllUndeletedIds/Users', null, sessionToken);
    } catch (e) {
        log("❌ Erro conexão IDs: " + e.message);
        return;
    }

    // DEBUG LOG
    log("   👉 Status IDs: " + resIds.status);
    log("   👉 Tipo Data: " + typeof resIds.data);
    if (!Array.isArray(resIds.data)) log("   👉 Data Preview: " + JSON.stringify(resIds.data).substring(0, 200));

    if (resIds.status !== 200 || !Array.isArray(resIds.data)) {
        log("❌ Erro ao obter IDs: " + resIds.status);
        return;
    }

    const allIds = resIds.data; // Lista [1, 2, 3...]
    log(`📦 Total de IDs encontrados: ${allIds.length}`);

    // Iterar (Limitado para teste inicial? Ou full?)
    // Vamos processar em lotes ou sequencial
    let count = 0;
    let imported = 0;
    let skipped = 0;

    // LIMIT FOR TESTING: First 50 VALID users
    // Remove checks later for production run
    for (const id of allIds) {
        count++;
        // Log de progresso a cada 50
        if (count % 50 === 0) log(`⏳ Processados: ${count}/${allIds.length}... (Imp: ${imported}, Skip: ${skipped})`);

        try {
            // Buscar Detalhes
            const resUser = await httpsRequest('GET', `/api/user/${id}`, null, sessionToken);
            if (resUser.status !== 200) continue;
            const u = resUser.data;

            // 1. Filtro de Validade
            if (!u.dateStartLimit || !u.dateLimit) {
                // skipped++; // Muito verbose se logar tudo
                continue;
            }

            // Opcional: Ignorar vencidos muito antigos?
            // const limitDate = new Date(u.dateLimit);
            // if (limitDate < new Date('2024-01-01')) { skipped++; continue; }

            // 2. Extrair Dados
            const nome = u.name;
            const rg = u.rg || "";
            const cpf = u.cpf || ""; // Se existir

            // Grupos (Empresa e Departamento)
            // Lógica: Tentar achar qual grupo é o "Departamento"
            let deptName = null;
            let empresaName = null;

            if (u.groups && Array.isArray(u.groups)) {
                // Se a API retornar objetos com nome
                for (const g of u.groups) {
                    if (g.name) {
                        // Ignorar grupos de sistema se houver
                        if (g.name === "Prestadores" || g.name === "Funcionarios") continue;

                        // Se tivermos uma lista de empresas conhecidas, ajudaria.
                        // Por enquanto, vamos pegar o PRIMEIRO grupo válido como departamento.
                        if (!deptName) deptName = g.name;
                    }
                }
            }

            // Se u.company estiver preenchido (idType 2)
            if (u.company && u.company.name) {
                empresaName = u.company.name;
            }

            // Se não achou empresa, usa uma default ou tenta extrair
            if (!empresaName) empresaName = "Empresa Externa";

            // Se não achou depto, jogar em "Geral"?
            if (!deptName) deptName = "Geral";

            // 3. Obter ID do Depto no Supabase
            const deptId = await getOrCreateDept(deptName);
            if (!deptId) {
                log(`   ❌ Falha fatal dept: ${deptName}`);
                continue;
            }

            // [NEW] Parse Checagem from Comments
            const { date: checagemDate, cleanComments } = parseChecagemDate(u.comments);

            // 4. Upsert Prestador e Solicitação
            // Usar RG como chave única? (Supabase tem ID, mas upsert precisa de chave)
            // Vamos buscar se já existe por RG
            let prestadorId = null;
            const { data: existingP } = await supabase.from('prestadores')
                .select('id')
                .eq('documento', rg) // RG limpo?
                .single();

            if (existingP) {
                prestadorId = existingP.id;
                // Update? Talvez só status
                await supabase.from('prestadores').update({
                    id_controle: u.id,
                    integrado_id_control: true,
                    data_integracao: new Date(),
                    checagem_valida_ate: checagemDate || undefined // Update checagem date if found
                }).eq('id', prestadorId);
            } else {
                // Insert
                const cleanedBloqueado = u.blocked ? true : false;
                const { data: newP, error: errorP } = await supabase.from('prestadores').insert([{
                    nome: nome,
                    documento: rg.replace(/[^a-zA-Z0-9]/g, ""),
                    documento2: cpf.replace(/[^0-9]/g, ""),
                    empresa: empresaName,
                    id_controle: u.id,
                    integrado_id_control: true,
                    status: cleanedBloqueado ? 'bloqueado' : 'aprovado',
                    cadastro: cleanedBloqueado ? 'bloqueada' : 'liberada',
                    tipo: 'prestador', // Default
                    checagem_valida_ate: checagemDate // [NEW] Insert checagem date
                }]).select().single();

                if (errorP) {
                    log("   ❌ Erro insert prestador: " + errorP.message);
                    continue;
                }
                prestadorId = newP.id;
            }

            // 5. Upsert Solicitação (Garantir que existe uma solicitação ativa/histórica para ele)
            // Verificar se já tem solicitação
            const { data: existingS } = await supabase.from('solicitacoes')
                .select('id')
                .eq('prestador_id', prestadorId)
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle();

            if (!existingS) {
                // Criar solicitação "Legada"
                const { error: errorS } = await supabase.from('solicitacoes').insert([{
                    prestador_id: prestadorId,
                    departamento_id: deptId,
                    data_inicial: u.dateStartLimit || new Date(),
                    data_final: u.dateLimit, // Data do ID Control
                    status: 'aprovada', // Assume aprovada pois existe no ID Control
                    tipo: 'servico', // Default
                    observacao: cleanComments && cleanComments.length > 0 ? cleanComments : 'Importado via Carga Inicial',
                    // checagem_valida_ate: checagemDate // Se tiver coluna redundante na solicitacao
                    // criado_por: null (Sistema)
                }]);

                if (errorS) log("   ❌ Erro insert solicitação: " + errorS.message);
                else {
                    imported++;
                    log(`   ✅ [${id}] Importado: ${nome} -> ${deptName} | Checagem: ${checagemDate || 'N/A'}`);
                }
            } else {
                imported++; // Já existia, mas conta como processado OK
            }

        } catch (e) {
            log(`   ❌ Erro processando ID ${id}: ${e.message}`);
        }
    }

    log(`🏁 Finalizado! Processados: ${count}, Importados/Atualizados: ${imported}, Pulados: ${skipped}`);
}

run();
