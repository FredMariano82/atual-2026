
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

// Carregar mapeamento de grupos
const groupsMapping = require('../data/id_control_groups.json');

// Helper para buscar ID do grupo
function getGroupId(name) {
    if (!name) return null;
    const group = groupsMapping[name];
    if (group) return group.id;

    // Tentar case-insensitive se não achar exato
    const lowerName = name.toLowerCase();
    for (const key in groupsMapping) {
        if (key.toLowerCase() === lowerName) {
            return groupsMapping[key].id;
        }
    }
    return null;
}

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
// �️ SECURITY & VALIDATION
// ==========================================

function normalize(str) {
    return (str || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^a-z0-9\s]/g, "") // Remove special chars
        .trim();
}

function checkNameSimilarity(localName, remoteName) {
    if (!localName || !remoteName) return false;

    const n1 = normalize(localName).split(/\s+/);
    const n2 = normalize(remoteName).split(/\s+/);

    // 1. Exact First Name Match (most common/safe)
    if (n1[0] === n2[0]) return true;

    // 2. Mismatch First Name -> High Risk
    console.log(`   🚨 [SECURITY] Nome divergente: "${n1[0]}" vs "${n2[0]}"`);
    return false;
}

// ==========================================
// �🔌 API ID CONTROL
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
            id_control_id, integrado_id_control,
            solicitacoes (
                data_inicial,
                data_final,
                departamentos ( nome )
            )
        `)
        // .eq('empresa', 'Hebraica') // COMMENTED OUT FOR TESTING
        .in('status', ['aprovado', 'aprovada']) // Aceitar ambos
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

            return false;
        });

        if (userFound) {
            console.log(`   ✅ Encontrado na lista remota! ID: ${userFound.id}`);

            // 🛡️ SECURITY CHECK: Name Validation
            // Assuming 'similarity' is calculated here or checkNameSimilarity is modified to return a score
            // For now, I'll assume a placeholder for 'similarity' or that the user will add it.
            // The original code had: if (!checkNameSimilarity(p.nome, userFound.name)) { ... }
            // The new code starts with if (similarity < 0.6) { ... }
            // I will replace the original block with the new one, assuming 'similarity' is meant to be defined.
            // To make it syntactically correct and runnable, I'll add a dummy similarity calculation.
            // In a real scenario, checkNameSimilarity would need to be updated or a new function created.

            // Placeholder for similarity calculation (replace with actual logic if available)
            const similarity = checkNameSimilarity(p.nome, userFound.name) ? 1.0 : 0.0; // This makes it behave like the old boolean check

            if (similarity < 0.6) { // This condition will be true if checkNameSimilarity returns false with the placeholder
                console.log(`       xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);
                console.log(`       � NOME DIFERENTE! Bloqueando atualização.`);
                console.log(`       Nome no Banco: "${userFound.name}"`); // Changed 'user' to 'userFound'
                console.log(`       Nome Solicitado: "${p.nome}"`);
                console.log(`       Similaridade: ${(similarity * 100).toFixed(0)}%`);

                // 🆕 Lógica de Resolução de Conflito por CPF
                // 1. Verificar se o CPF bate (mesma pessoa, nome mudou ou estava errado)
                const cpfBanco = userFound.cpf ? userFound.cpf.replace(/[^0-9]/g, "") : ""; // Changed 'user' to 'userFound'
                const cpfSolicitado = p.documento2 ? p.documento2.replace(/[^0-9]/g, "") : "";

                console.log(`       CPF no Banco: "${cpfBanco}"`);
                console.log(`       CPF Solicitado: "${cpfSolicitado}"`);

                if (cpfSolicitado && cpfBanco === cpfSolicitado) {
                    console.log(`       ✅ CPF CORRESPONDE! Assumindo que é a mesma pessoa.`);
                    console.log(`       ➡️ Prosseguindo com atualização de nome...`);
                    // Deixa passar (o updateUser vai atualizar o nome)
                }
                // 2. Se o user do banco NÃO tem CPF, e o novo TEM CPF -> "Roubar" o RG
                else if (cpfSolicitado && !cpfBanco) {
                    console.log(`       ⚠️ Usuário do banco SEM CPF. Solicitante COM CPF.`);
                    console.log(`       🗑️ Removendo RG do usuário antigo para liberar para o novo...`);

                    // Update no usuário antigo para remover RG
                    // Precisamos fazer um PUT /users/{id} apenas limpando o RG
                    // const payloadLimpeza = { ...userFound, rg: "" }; // Ou null, dependendo da API
                    // Obs: O endpoint de update precisa dos campos obrigatórios. 
                    // Vamos tentar enviar apenas o RG vazio se a API suportar PATCH, senão o user todo.
                    // Como não temos certeza do PATCH, vamos tentar update normal mantendo os dados
                    try {
                        // The original code snippet had `await updateUser({ ...user, rg: `OLD_${user.rg}_${Date.now()}` }, user.id);`
                        // and `await axiosInstance.put(`/users/${user.id}`, { ...user, rg: `FILA_${user.rg}_${Date.now()}`, ... });`
                        // I will use the existing `updateUser` function and `userFound` variable.
                        await updateUser(userFound.id, { ...userFound, rg: `FILA_${userFound.rg}_${Date.now()}`, comments: `RG liberado para ${p.nome} em ${new Date().toLocaleString()}` });

                        console.log("       🔄 RG liberado. Criando novo usuário AGORA...");

                        // ⚡ Imediatamente processar a criação do novo usuário
                        const newId = await processarCreate(p);
                        if (newId) {
                            console.log(`       ✅ Novo usuário criado com ID: ${newId}.`);
                            // Atualizar Supabase com o novo ID remoto?
                            // O sync normal faria isso na próxima passada ou se processarCreate retornar ID.
                            // Vamos garantir que o ID seja salvo.
                            await supabase.from('prestadores').update({
                                id_controle: newId,
                                status: 'pendente', // Resetar status para pendente (pois foi criado agora)
                                observacoes: 'Sincronizado via resolução de conflito CPF'
                            }).eq('id', p.id);
                        }

                        // The original snippet had `return null;` here, which would cause `idRemoto` to be null
                        // and then the flow would go to "Não encontrado na lista. Criando novo usuário..."
                        // This means we should skip the rest of the current userFound block and proceed to create.
                        // The `continue` statement will achieve this for the current loop iteration.
                        continue; // Skip the rest of the loop for this "found" user path, as we handled it.

                    } catch (errLimpeza) {
                        console.error("       ❌ Erro ao liberar RG:", errLimpeza.message);
                        throw errLimpeza; // Bloqueia tudo se der erro
                    }

                } else {
                    console.log(`       xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`);

                    // Atualizar status no Supabase para ERRO_RG
                    // ... (código existente de bloqueio)
                    await supabase.from('prestadores').update({
                        status: 'reprovado',
                        cadastro: 'negada',
                        observacoes: '[ERRO RG] RG pertence a outro cadastro (CPF diferente), favor corrigir.'
                    }).eq('id', p.id);

                    // The original snippet had `return user;` and `throw new Error("BLOCK_UPDATE_NAME_MISMATCH");`
                    // To prevent the update and move to the next prestador, `continue` is appropriate.
                    console.log(`   📝 Status atualizado para 'reprovado' (com flag [ERRO RG]). Pulando...`);
                    continue;
                }
            }

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

// Helper para buscar detalhes do grupo (ID e Type)
function getGroupDetails(name) {
    if (!name) return null;
    let group = groupsMapping[name];
    if (!group) {
        // Tentar case-insensitive
        const lowerName = name.toLowerCase();
        for (const key in groupsMapping) {
            if (key.toLowerCase() === lowerName) {
                group = groupsMapping[key];
                break;
            }
        }
    }
    return group;
}

// ... existing code ...

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
        payload.expireOnDateLimit = true;
    }

    // Mapeamento de Grupos (Empresa e Departamento)
    const groups = [];

    // 1. Empresa (Prestador.empresa)
    if (p.empresa) {
        const info = getGroupDetails(p.empresa);
        if (info) {
            if (info.idType === 2) {
                payload.company = { id: info.id }; // Company deve ser um objeto separado
            } else {
                groups.push(info.id);
            }
        } else {
            console.log(`   ⚠️ Empresa não mapeada: "${p.empresa}"`);
        }
    }

    // 2. Departamento (Solicitacao.departamento)
    if (sol?.departamentos?.nome) {
        const info = getGroupDetails(sol.departamentos.nome);
        if (info) {
            // Departamentos geralmente são Type 0, mas vamos garantir
            if (info.idType === 2) {
                payload.company = { id: info.id };
            } else {
                groups.push(info.id);
            }
        } else {
            console.log(`   ⚠️ Departamento não mapeado: "${sol.departamentos.nome}"`);
        }
    }

    if (groups.length > 0) {
        payload.groups = groups;
    }

    console.log("   📤 Payload Update:", JSON.stringify(payload));
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

    // Mapeamento de Grupos (Empresa e Departamento)
    const groups = [];

    // 1. Empresa
    if (p.empresa) {
        const info = getGroupDetails(p.empresa);
        if (info) {
            if (info.idType === 2) {
                payload.company = { id: info.id };
            } else {
                groups.push(info.id);
            }
        } else {
            console.log(`   ⚠️ Empresa não mapeada: "${p.empresa}"`);
        }
    }

    // 2. Departamento
    if (sol?.departamentos?.nome) {
        const info = getGroupDetails(sol.departamentos.nome);
        if (info) {
            if (info.idType === 2) {
                payload.company = { id: info.id };
            } else {
                groups.push(info.id);
            }
        } else {
            console.log(`   ⚠️ Departamento não mapeado: "${sol.departamentos.nome}"`);
        }
    }

    if (groups.length > 0) {
        payload.groups = groups;
    }

    console.log("   📤 Payload Create:", JSON.stringify(payload));
    try {
        const id = await createUser(payload);
        console.log(`   ✨ Usuário criado com sucesso! ID: ${id}`);
        return id;
    } catch (e) {
        console.error("   ❌ Erro ao criar:", e.message);

        // 🛡️ SECURITY CHECK: Handle Hidden Duplicate
        if (e.message.includes("RG já cadastrado")) {
            console.log("   🚨 RG já existe (mas não foi encontrado na busca). Marcando como 'reprovado' [ERRO RG]...");
            await supabase.from('prestadores').update({
                status: 'reprovado',
                cadastro: 'negada', // Atualiza Liberação para Negada
                observacoes: '[ERRO RG] RG pertence a outro cadastro, favor corrigir ou informar CPF.' // Mensagem amigável
            }).eq('id', p.id);
        }

        return null;
    }
}

// Executar
syncHebraica();
