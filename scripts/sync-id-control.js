// 🔄 Sincronizador Supabase -> ID Control (Soberania do Supabase)
// Executar: node scripts/sync-id-control.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Configurações
const ID_CONTROL_URL = "https://192.168.100.20:30443";
const CHECK_INTERVAL_MS = 1 * 60 * 1000; // 1 minuto para ser ágil
const ID_CONTROL_USER = "mariano";
const ID_CONTROL_PASS = "hebraica";

// Inicializar Supabase
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

let sessionToken = null;

// ==========================================
// 🛠️ FUNÇÕES DE API
// ==========================================

async function loginIdControl() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
    try {
        const response = await fetch(`${ID_CONTROL_URL}/api/login/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: ID_CONTROL_USER, password: ID_CONTROL_PASS })
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        sessionToken = data.accessToken || data.token;
        return !!sessionToken;
    } catch (e) {
        console.error("❌ Erro login:", e.message);
        return false;
    }
}

async function buscarUsuarioIdControl(documento) {
    if (!sessionToken && !await loginIdControl()) return null;
    try {
        const docLimpo = documento.replace(/[^0-9]/g, "");
        // TENTA BUSCA EXATA (ajustar conforme API real)
        // Se a API suportar query params:
        const response = await fetch(`${ID_CONTROL_URL}/api/users?rg=${docLimpo}`, {
            headers: { "Authorization": `Bearer ${sessionToken}` }
        });

        if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) return data[0];
            if (data.id) return data;
        }
    } catch (e) {
        console.error("⚠️ Erro na busca:", e.message);
    }
    return null;
}

async function criarUsuarioIdControl(prestador) {
    if (!sessionToken) await loginIdControl();

    // MAPEAMENTO INICIAL (Será refinado com o usuário)
    const payload = {
        name: prestador.nome,
        rg: prestador.documento.replace(/[^0-9]/g, ""),
        begin_time: prestador.data_inicial,
        end_time: prestador.data_final
    };

    console.log("   📤 Payload Criação:", payload);

    const response = await fetch(`${ID_CONTROL_URL}/api/user/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken}` },
        body: JSON.stringify(payload)
    });

    if (response.ok) return await response.json();
    throw new Error(await response.text());
}

async function atualizarUsuarioIdControl(idControlId, prestador) {
    if (!sessionToken) await loginIdControl();

    // IMPOSIÇÃO DAS DATAS DO SUPABASE
    const payload = {
        name: prestador.nome,
        begin_time: prestador.data_inicial,
        end_time: prestador.data_final
    };

    console.log("   📤 Payload Atualização (Datas):", payload);

    const response = await fetch(`${ID_CONTROL_URL}/api/user/${idControlId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionToken}` },
        body: JSON.stringify(payload)
    });

    if (response.ok) return await response.json();
    throw new Error(await response.text());
}

// ==========================================
// 🚀 LÓGICA PRINCIPAL (Check-Then-Upsert)
// ==========================================

async function processarPendentes() {
    // Busca prestadores aprovados e não integrados
    const { data: pendentes, error } = await supabase
        .from('prestadores')
        .select(`
            id, nome, documento, status, 
            solicitacao_id, 
            solicitacoes ( data_inicial, data_final )
        `)
        .eq('status', 'aprovada')
        .is('integrado_id_control', false)
        .limit(5);

    if (error) {
        console.error("❌ Erro ao buscar pendentes:", error.message);
        return;
    }

    if (!pendentes || pendentes.length === 0) {
        // console.log("💤 Nada para processar..."); 
        return;
    }

    console.log(`📦 Processando ${pendentes.length} novos prestadores...`);

    for (const p of pendentes) {
        console.log(`🔄 Prestador: ${p.nome} (${p.documento})`);

        // Flattening das datas
        // Se a solicitacao for array (join), pega o primeiro. Se for obj, pega direto.
        const sol = Array.isArray(p.solicitacoes) ? p.solicitacoes[0] : p.solicitacoes;

        // Formatar datas para ISO ou formato esperado pelo ID Control
        // Assumindo que ID Control aceita ISO ou Timestamp
        const dataInicial = sol?.data_inicial ? new Date(sol.data_inicial).getTime() / 1000 : null; // Exemplo Timestamp Unix
        const dataFinal = sol?.data_final ? new Date(sol.data_final).getTime() / 1000 : null;

        // Vamos usar formato string ISO por enquanto e ver o erro se der
        const dadosEnvio = {
            ...p,
            // Converter para o formato que o ID Control espera (ajustaremos no passo de mapeamento)
            // Por enquanto enviando string crua para debug
            data_inicial: sol?.data_inicial,
            data_final: sol?.data_final
        };

        try {
            // A. INVESTIGAÇÃO
            const usuarioExistente = await buscarUsuarioIdControl(p.documento);
            let idControlRemoto = null;

            if (usuarioExistente) {
                console.log(`   ✅ Encontrado no ID Control: ID ${usuarioExistente.id}`);
                idControlRemoto = usuarioExistente.id;

                // B. ATUALIZAÇÃO SOBERANA
                console.log(`   ✏️ Atualizando datas no ID Control...`);
                await atualizarUsuarioIdControl(idControlRemoto, dadosEnvio);

            } else {
                console.log(`   🆕 Não existe. Criando novo no ID Control...`);
                // C. CRIAÇÃO
                const novoUsuario = await criarUsuarioIdControl(dadosEnvio);
                idControlRemoto = novoUsuario.id; // Ajustar conforme retorno da API
            }

            // D. VÍNCULO NO SUPABASE
            if (idControlRemoto) {
                const { error: updateError } = await supabase
                    .from('prestadores')
                    .update({
                        integrado_id_control: true,
                        id_control_id: idControlRemoto,
                        data_integracao: new Date()
                    })
                    .eq('id', p.id);

                if (updateError) throw updateError;
                console.log(`   🏁 Sucesso! Vinculado ao ID ${idControlRemoto}`);
            }

        } catch (err) {
            console.error(`   ❌ Falha no processamento:`, err.message);
        }
    }
}

// Loop
console.log("🚀 Monitor de Sincronia Iniciado (Modo: Soberania Supabase)");
setInterval(processarPendentes, CHECK_INTERVAL_MS);
processarPendentes(); // Executa 1x imediatamente
