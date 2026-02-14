
const { createClient } = require("@supabase/supabase-js");

// Credenciais (Hardcoded para execução one-off garantida)
const supabaseUrl = "https://icsictpkalcuwotlatyb.supabase.co";
// Usando a ANON KEY já que ela funcionou para seed-users.js
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imljc2ljdHBrYWxjdXdvdGxhdHliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMTM2NTUsImV4cCI6MjA4Mzc4OTY1NX0.9B51dPPBsLwM2yftx4KCkZCUWUTFfjqKWRHsr0PfPRk";

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Credenciais não encontradas.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helpers para dados fake
const nomes = ["João", "Maria", "Pedro", "Ana", "Carlos", "Fernanda", "Luiz", "Cláudia", "Roberto", "Patrícia"];
const sobrenomes = ["Silva", "Santos", "Oliveira", "Souza", "Pereira", "Lima", "Ferreira", "Costa"];
const empresas = ["Tech Solutions", "Serviços Gerais Ltda", "Eventos Top", "Construtora Forte", "Segurança 24h", "Limpeza Total", "Catering Deluxe"];
const locais = ["Teatro", "Salão de Festas", "Quadra Poliesportiva", "Piscina", "Entrada Principal", "Estacionamento"];

function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function gerarNome() {
    return `${randomItem(nomes)} ${randomItem(sobrenomes)}`;
}

function gerarDocumento() {
    // Gera um CPF falso formatado
    const n = () => Math.floor(Math.random() * 10);
    return `${n()}${n()}${n()}.${n()}${n()}${n()}.${n()}${n()}${n()}-${n()}${n()}`;
}

function adicionarDias(data, dias) {
    const result = new Date(data);
    result.setDate(result.getDate() + dias);
    return result;
}

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

async function seedSolicitacoes() {
    console.log("🌱 Iniciando criação de solicitações...");

    // 1. Buscar usuários do tipo solicitante
    const { data: usuarios, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("perfil", "solicitante");

    if (userError || !usuarios || usuarios.length === 0) {
        console.error("❌ Erro ao buscar solicitantes ou nenhum encontrado:", userError);
        return;
    }

    console.log(`👥 Encontrados ${usuarios.length} solicitantes. Gerando dados para cada um...`);

    const agora = new Date();
    const ano = agora.getFullYear();
    let numeroSeq = 1000; // Começar de um número alto para não conflitar com existentes

    for (const usuario of usuarios) {
        console.log(`PROCESSING USER: ${usuario.nome}`);

        // Gerar 10 solicitações para cada usuário
        for (let i = 0; i < 10; i++) {
            numeroSeq++;
            const numeroSolicitacao = `${ano}-${numeroSeq}`;

            // Cenários de datas para testar filtros
            // 0-3: Passado (Vencido)
            // 4-6: Futuro Próximo (Urgente/Ativo)
            // 7-9: Futuro Distante
            let dataInicial, dataFinal, statusGeral;

            if (i < 3) { // Vencidas
                dataInicial = adicionarDias(agora, -20);
                dataFinal = adicionarDias(agora, -10); // Já venceu
                statusGeral = "aprovado"; // Era aprovada mas venceu
            } else if (i < 6) { // Ativas / Próximas
                dataInicial = adicionarDias(agora, -2);
                dataFinal = adicionarDias(agora, 5); // Vence em 5 dias
                statusGeral = "pendente";
            } else { // Futuras
                dataInicial = adicionarDias(agora, 10);
                dataFinal = adicionarDias(agora, 15);
                statusGeral = "pendente";
            }

            // Criar Solicitação
            const { data: solicitacao, error: solError } = await supabase
                .from("solicitacoes")
                .insert([{
                    numero: numeroSolicitacao,
                    solicitante: usuario.nome,
                    departamento: usuario.departamento,
                    usuario_id: usuario.id,
                    data_solicitacao: formatDate(adicionarDias(agora, -5)), // Solicitado 5 dias atrás
                    hora_solicitacao: "10:00:00",
                    tipo_solicitacao: "checagem_liberacao",
                    finalidade: i % 2 === 0 ? "evento" : "obra",
                    local: randomItem(locais),
                    empresa: randomItem(empresas),
                    data_inicial: formatDate(dataInicial),
                    data_final: formatDate(dataFinal),
                    status_geral: statusGeral,
                    custo_checagem: 0,
                    economia_gerada: 0
                }])
                .select()
                .single();

            if (solError) {
                console.error(`❌ Erro ao criar solicitação ${numeroSolicitacao}:`, solError.message);
                continue;
            }

            // Adicionar 1 a 3 prestadores por solicitação
            const numPrestadores = Math.floor(Math.random() * 3) + 1;

            for (let p = 0; p < numPrestadores; p++) {
                // Status varied based on solicitation logic broadly
                let statusPrestador = "pendente";
                let statusCadastro = "pendente";
                let checagemValidaAte = null;

                if (i < 3) { // Solicitação Vencida
                    statusPrestador = "aprovado";
                    statusCadastro = "ok";
                    checagemValidaAte = formatDate(adicionarDias(agora, -5)); // Checagem também venceu
                } else if (i === 4) { // Um reprovado para testar
                    statusPrestador = "reprovado";
                    statusCadastro = "pendente";
                } else if (i === 5) { // Um com checagem válida
                    statusPrestador = "aprovado";
                    statusCadastro = "ok";
                    checagemValidaAte = formatDate(adicionarDias(agora, 60));
                }

                await supabase.from("prestadores").insert([{
                    solicitacao_id: solicitacao.id,
                    nome: gerarNome(),
                    documento: gerarDocumento(),
                    empresa: solicitacao.empresa, // Herda da solicitação
                    status: statusPrestador,
                    cadastro: statusCadastro,
                    checagem_valida_ate: checagemValidaAte
                }]);
            }
        }
    }

    console.log("✅ Seed de solicitações concluído!");
}

seedSolicitacoes();
