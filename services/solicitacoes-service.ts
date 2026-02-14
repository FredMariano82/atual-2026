import { supabase } from "@/lib/supabase"
import type { Solicitacao } from "@/types"

export class SolicitacoesService {
  // Criar nova solicitação
  static async criarSolicitacao(dados: {
    solicitante: string
    departamento: string
    usuarioId: string
    tipoSolicitacao: "checagem_liberacao" | "somente_liberacao"
    finalidade: "evento" | "obra"
    local: string
    empresa: string
    prestadores: Array<{ nome: string; documento: string; documento2?: string; empresa?: string }>
    dataInicial: string
    dataFinal: string
  }): Promise<{ sucesso: boolean; erro: string; solicitacao?: Solicitacao }> {
    try {
      console.log("📝 PRODUÇÃO REAL: Criando nova solicitação...")
      console.log("🏢 EMPRESA GERAL DA SOLICITAÇÃO:", dados.empresa)
      console.log(
        "👥 PRESTADORES COM EMPRESAS:",
        dados.prestadores.map((p) => ({ nome: p.nome, empresa: p.empresa })),
      )

      // Verificar conexão com Supabase
      if (!supabase) {
        console.error("❌ PRODUÇÃO REAL: Supabase não inicializado")
        return { sucesso: false, erro: "Erro de configuração do banco de dados" }
      }

      // Gerar número da solicitação no formato ANO-000000
      const agoraOriginal = new Date()
      const ano = agoraOriginal.getFullYear()

      // Buscar último número do ano atual com timeout
      const { data: ultimaSolicitacao, error: erroConsulta } = (await Promise.race([
        supabase
          .from("solicitacoes")
          .select("numero")
          .like("numero", `${ano}-%`)
          .order("numero", { ascending: false })
          .limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na consulta")), 10000)),
      ])) as any

      let proximoNumero = 1
      if (!erroConsulta && ultimaSolicitacao && ultimaSolicitacao.length > 0) {
        try {
          const ultimoNumero = ultimaSolicitacao[0].numero
          const numeroAtual = Number.parseInt(ultimoNumero.split("-")[1])
          proximoNumero = numeroAtual + 1
        } catch (error) {
          console.warn("Erro ao extrair número, usando 1 como fallback")
          proximoNumero = 1
        }
      }

      // Formato: ANO-000000 (6 dígitos)
      const numeroSolicitacao = `${ano}-${proximoNumero.toString().padStart(6, "0")}`

      // Determinar status de liberação baseado na data inicial
      // CORREÇÃO: Usar data local brasileira para comparação
      const agora = new Date()
      const hojeLocal = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
      const hojeFormatado = `${hojeLocal.getFullYear()}-${String(hojeLocal.getMonth() + 1).padStart(2, "0")}-${String(hojeLocal.getDate()).padStart(2, "0")}`
      // CORREÇÃO: Urgente APENAS quando data inicial === data atual (não <=)
      const isUrgente = dados.dataInicial === hojeFormatado

      console.log(`📅 CORREÇÃO URGÊNCIA - Data atual: ${hojeFormatado}`)
      console.log(`📅 CORREÇÃO URGÊNCIA - Data inicial: ${dados.dataInicial}`)
      console.log(`📅 CORREÇÃO URGÊNCIA - É urgente? ${isUrgente}`)

      // 🎯 CRIAR SOLICITAÇÃO COM EMPRESA GERAL
      const { data: solicitacao, error: solicitacaoError } = (await Promise.race([
        supabase
          .from("solicitacoes")
          .insert([
            {
              numero: numeroSolicitacao,
              solicitante: dados.solicitante,
              departamento: dados.departamento,
              usuario_id: dados.usuarioId,
              data_solicitacao: agora.toISOString().split("T")[0],
              hora_solicitacao: agora.toTimeString().split(" ")[0],
              tipo_solicitacao: dados.tipoSolicitacao,
              finalidade: dados.finalidade,
              local: dados.local,
              empresa: dados.empresa, // 🎯 EMPRESA GERAL SALVA NA TABELA SOLICITACOES
              data_inicial: dados.dataInicial,
              data_final: dados.dataFinal,
              status_geral: "pendente",
              custo_checagem: dados.tipoSolicitacao === "checagem_liberacao" ? dados.prestadores.length * 20 : 0,
              economia_gerada: 0,
            },
          ])
          .select()
          .single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na inserção")), 15000)),
      ])) as any

      if (solicitacaoError) {
        console.error("PRODUÇÃO REAL: Erro ao criar solicitação:", solicitacaoError)
        return { sucesso: false, erro: `Erro ao criar solicitação: ${solicitacaoError.message}` }
      }

      console.log("✅ PRODUÇÃO REAL: Solicitação criada com empresa geral:", dados.empresa)

      // 🎯 CRIAR PRESTADORES COM EMPRESAS ESPECÍFICAS OU HERDADAS
      const prestadoresData = dados.prestadores.map((p) => {
        // Se prestador não tem empresa específica, usar empresa geral da solicitação
        const empresaFinal = p.empresa?.trim() || dados.empresa

        console.log(`👤 Prestador ${p.nome}: empresa específica="${p.empresa}" | empresa final="${empresaFinal}"`)

        return {
          solicitacao_id: solicitacao.id,
          nome: p.nome,
          documento: p.documento,
          documento2: p.documento2 || null,
          empresa: empresaFinal, // 🎯 EMPRESA ESPECÍFICA OU GERAL
          status: "pendente" as const,
          cadastro: isUrgente ? ("urgente" as const) : ("pendente" as const),
        }
      })

      console.log("📝 PRODUÇÃO REAL: Dados dos prestadores para inserir:", prestadoresData)

      const { error: prestadoresError } = (await Promise.race([
        supabase.from("prestadores").insert(prestadoresData),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na inserção de prestadores")), 10000)),
      ])) as any

      if (prestadoresError) {
        console.error("PRODUÇÃO REAL: Erro ao criar prestadores:", prestadoresError)
        // Reverter criação da solicitação
        await supabase.from("solicitacoes").delete().eq("id", solicitacao.id)
        return { sucesso: false, erro: `Erro ao criar prestadores: ${prestadoresError.message}` }
      }

      console.log("✅ PRODUÇÃO REAL: Solicitação criada com sucesso:", numeroSolicitacao)

      return {
        sucesso: true,
        erro: "",
        solicitacao: await this.buscarSolicitacaoPorId(solicitacao.id),
      }
    } catch (error: any) {
      console.error("💥 PRODUÇÃO REAL: Erro ao criar solicitação:", error)

      if (error.message?.includes("Failed to fetch")) {
        return { sucesso: false, erro: "Erro de conexão com o banco de dados. Verifique sua internet." }
      }

      if (error.message?.includes("Timeout")) {
        return { sucesso: false, erro: "Operação demorou muito para responder. Tente novamente." }
      }

      return { sucesso: false, erro: `Erro interno: ${error.message || "Erro desconhecido"}` }
    }
  }

  // Buscar solicitação por ID
  static async buscarSolicitacaoPorId(id: string): Promise<Solicitacao | null> {
    try {
      if (!supabase) {
        console.error("❌ PRODUÇÃO REAL: Supabase não inicializado")
        return null
      }

      const { data: solicitacao, error: solicitacaoError } = (await Promise.race([
        supabase.from("solicitacoes").select("*").eq("id", id).single(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na consulta")), 10000)),
      ])) as any

      if (solicitacaoError || !solicitacao) {
        console.error("PRODUÇÃO REAL: Erro ao buscar solicitação:", solicitacaoError)
        return null
      }

      const { data: prestadores, error: prestadoresError } = (await Promise.race([
        supabase.from("prestadores").select("*").eq("solicitacao_id", id),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na consulta de prestadores")), 10000)),
      ])) as any

      if (prestadoresError) {
        console.error("PRODUÇÃO REAL: Erro ao buscar prestadores:", prestadoresError)
        return null
      }

      return {
        id: solicitacao.id,
        numero: solicitacao.numero,
        solicitante: solicitacao.solicitante,
        departamento: solicitacao.departamento,
        dataSolicitacao: new Date(solicitacao.data_solicitacao + "T00:00:00").toLocaleDateString("pt-BR"),
        horaSolicitacao: solicitacao.hora_solicitacao,
        tipoSolicitacao: solicitacao.tipo_solicitacao,
        finalidade: solicitacao.finalidade,
        local: solicitacao.local,
        empresa: solicitacao.empresa, // 🎯 EMPRESA GERAL DA SOLICITAÇÃO
        prestadores: prestadores.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          documento: p.documento,
          documento2: p.documento2 || undefined,
          empresa: p.empresa || undefined, // 🎯 EMPRESA ESPECÍFICA DO PRESTADOR
          status: p.status as "aprovado" | "reprovado" | "pendente" | "excecao",
          checagemValidaAte: p.checagem_valida_ate || undefined,
          cadastro: p.cadastro as "ok" | "pendente" | "urgente",
          observacoes: p.observacoes || undefined,
          aprovadoPor: p.aprovado_por || undefined,
          dataAvaliacao: p.data_avaliacao
            ? new Date(p.data_avaliacao + "T00:00:00").toLocaleDateString("pt-BR")
            : undefined,
          justificativa: p.justificativa || undefined,
        })),
        dataInicial: new Date(solicitacao.data_inicial + "T00:00:00").toLocaleDateString("pt-BR"),
        dataFinal: new Date(solicitacao.data_final + "T00:00:00").toLocaleDateString("pt-BR"),
        statusGeral: solicitacao.status_geral as "pendente" | "aprovado" | "reprovado" | "parcial",
        observacoesGerais: solicitacao.observacoes_gerais || undefined,
        economia: solicitacao.economia as "economia1" | "economia2" | null,
        custoChecagem: solicitacao.custo_checagem,
        economiaGerada: solicitacao.economia_gerada || 0,
      }
    } catch (error: any) {
      console.error("PRODUÇÃO REAL: Erro ao buscar solicitação:", error)

      if (error.message?.includes("Failed to fetch")) {
        console.error("❌ PRODUÇÃO REAL: Erro de conexão com Supabase")
      }

      return null
    }
  }

  // Listar solicitações com filtros
  static async listarSolicitacoes(filtros?: {
    departamento?: string
    solicitante?: string
    status?: string
    dataInicial?: string
    dataFinal?: string
  }): Promise<Solicitacao[]> {
    try {
      console.log("🔍 PRODUÇÃO REAL: Buscando solicitações...", filtros)

      if (!supabase) {
        console.error("❌ PRODUÇÃO REAL: Supabase não inicializado")
        return []
      }

      let query = supabase
        .from("solicitacoes")
        .select(`
          *,
          prestadores (*)
        `)
        .order("created_at", { ascending: false })

      if (filtros?.departamento) {
        query = query.eq("departamento", filtros.departamento)
      }

      if (filtros?.solicitante) {
        query = query.eq("solicitante", filtros.solicitante)
      }

      if (filtros?.status) {
        query = query.eq("status_geral", filtros.status)
      }

      if (filtros?.dataInicial) {
        query = query.gte("data_solicitacao", filtros.dataInicial)
      }

      if (filtros?.dataFinal) {
        query = query.lte("data_solicitacao", filtros.dataFinal)
      }

      const { data: solicitacoes, error } = (await Promise.race([
        query,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na consulta de solicitações")), 15000)),
      ])) as any

      if (error) {
        console.error("PRODUÇÃO REAL: Erro ao listar solicitações:", error)
        throw error
      }

      if (!solicitacoes || solicitacoes.length === 0) {
        console.log("📋 PRODUÇÃO REAL: Nenhuma solicitação encontrada")
        return []
      }

      console.log(`✅ PRODUÇÃO REAL: ${solicitacoes.length} solicitações encontradas`)

      return solicitacoes.map((s: any) => ({
        id: s.id,
        numero: s.numero,
        solicitante: s.solicitante,
        departamento: s.departamento,
        dataSolicitacao: new Date(s.data_solicitacao + "T00:00:00").toLocaleDateString("pt-BR"),
        horaSolicitacao: s.hora_solicitacao,
        tipoSolicitacao: s.tipo_solicitacao,
        finalidade: s.finalidade,
        local: s.local,
        empresa: s.empresa, // 🎯 EMPRESA GERAL DA SOLICITAÇÃO
        prestadores: (s.prestadores || []).map((p: any) => ({
          id: p.id,
          nome: p.nome,
          documento: p.documento,
          documento2: p.documento2 || undefined,
          empresa: p.empresa || undefined, // 🎯 EMPRESA ESPECÍFICA DO PRESTADOR
          status: p.status,
          checagemValidaAte: p.checagem_valida_ate || undefined,
          cadastro: p.cadastro,
          observacoes: p.observacoes || undefined,
          aprovadoPor: p.aprovado_por || undefined,
          dataAvaliacao: p.data_avaliacao
            ? new Date(p.data_avaliacao + "T00:00:00").toLocaleDateString("pt-BR")
            : undefined,
          justificativa: p.justificativa || undefined,
        })),
        dataInicial: new Date(s.data_inicial + "T00:00:00").toLocaleDateString("pt-BR"),
        dataFinal: new Date(s.data_final + "T00:00:00").toLocaleDateString("pt-BR"),
        statusGeral: s.status_geral,
        observacoesGerais: s.observacoes_gerais || undefined,
        economia: s.economia,
        custoChecagem: s.custo_checagem,
        economiaGerada: s.economia_gerada || 0,
      }))
    } catch (error: any) {
      console.error("💥 PRODUÇÃO REAL: Erro ao listar solicitações:", error)

      if (error.message?.includes("Failed to fetch")) {
        console.error("❌ PRODUÇÃO REAL: Erro de conexão: Verifique se o Supabase está configurado corretamente")
        console.error("🔧 PRODUÇÃO REAL: Variáveis de ambiente:", {
          SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Definida" : "❌ Não definida",
          SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Definida" : "❌ Não definida",
        })
      }

      if (error.message?.includes("Timeout")) {
        console.error("⏱️ PRODUÇÃO REAL: Timeout: Consulta demorou muito para responder")
      }

      return []
    }
  }

  // Avaliar prestador - APENAS para Checagem
  static async avaliarPrestador(
    prestadorId: string,
    novoStatus: "aprovado" | "reprovado",
    aprovadoPor: string,
    justificativa?: string,
  ): Promise<{ sucesso: boolean; erro: string }> {
    try {
      if (!supabase) {
        return { sucesso: false, erro: "Erro de configuração do banco de dados" }
      }

      const agora = new Date()

      const updateData: any = {
        status: novoStatus, // APENAS status (Checagem)
        aprovado_por: aprovadoPor,
        data_avaliacao: agora.toISOString(),
        updated_at: agora.toISOString(),
      }

      if (novoStatus === "aprovado") {
        // Calcular validade da checagem (6 meses)
        const validadeChecagem = new Date()
        validadeChecagem.setMonth(validadeChecagem.getMonth() + 6)
        updateData.checagem_valida_ate = validadeChecagem.toISOString().split("T")[0]
      }

      if (justificativa) {
        // PRODUÇÃO REAL: Salvar justificativa no campo correto
        updateData.justificativa = justificativa
      }

      // IMPORTANTE: NÃO alterar o campo cadastro (Liberação)
      // A coluna Liberação é independente da coluna Checagem

      const { error } = (await Promise.race([
        supabase.from("prestadores").update(updateData).eq("id", prestadorId),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout na atualização")), 10000)),
      ])) as any

      if (error) {
        console.error("PRODUÇÃO REAL: Erro ao avaliar prestador:", error)
        return { sucesso: false, erro: `Erro ao avaliar prestador: ${error.message}` }
      }

      // Atualizar status geral da solicitação
      await this.atualizarStatusGeralSolicitacao(prestadorId)

      console.log("✅ PRODUÇÃO REAL: Prestador avaliado com sucesso")
      return { sucesso: true, erro: "" }
    } catch (error: any) {
      console.error("PRODUÇÃO REAL: Erro ao avaliar prestador:", error)

      if (error.message?.includes("Failed to fetch")) {
        return { sucesso: false, erro: "Erro de conexão com o banco de dados" }
      }

      return { sucesso: false, erro: `Erro interno: ${error.message}` }
    }
  }

  // Atualizar status geral da solicitação baseado nos prestadores
  private static async atualizarStatusGeralSolicitacao(prestadorId: string): Promise<void> {
    try {
      if (!supabase) return

      // Buscar a solicitação do prestador
      const { data: prestador } = await supabase
        .from("prestadores")
        .select("solicitacao_id")
        .eq("id", prestadorId)
        .single()

      if (!prestador) return

      // Buscar todos os prestadores da solicitação
      const { data: prestadores } = await supabase
        .from("prestadores")
        .select("status")
        .eq("solicitacao_id", prestador.solicitacao_id)

      if (!prestadores) return

      const statusList = prestadores.map((p) => p.status)
      let novoStatus: string

      if (statusList.every((s) => s === "aprovado")) {
        novoStatus = "aprovado"
      } else if (statusList.every((s) => s === "reprovado")) {
        novoStatus = "reprovado"
      } else if (statusList.some((s) => s === "aprovado") && statusList.some((s) => s === "reprovado")) {
        novoStatus = "parcial"
      } else {
        novoStatus = "pendente"
      }

      await supabase
        .from("solicitacoes")
        .update({
          status_geral: novoStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", prestador.solicitacao_id)

      console.log("✅ PRODUÇÃO REAL: Status geral atualizado para:", novoStatus)
    } catch (error) {
      console.error("PRODUÇÃO REAL: Erro ao atualizar status geral:", error)
    }
  }
}

// Funções individuais para compatibilidade com outros imports

// Buscar todas as solicitações (para administrador)
export async function getAllSolicitacoes() {
  try {
    const solicitacoes = await SolicitacoesService.listarSolicitacoes()
    console.log("✅ PRODUÇÃO REAL: getAllSolicitacoes executado com sucesso")
    return solicitacoes
  } catch (error: any) {
    console.error("PRODUÇÃO REAL: Erro ao buscar todas solicitações:", error)
    return []
  }
}

// Buscar solicitações por departamento
export async function getSolicitacoesByDepartamento(departamento: string) {
  try {
    const solicitacoes = await SolicitacoesService.listarSolicitacoes({ departamento })
    console.log("✅ PRODUÇÃO REAL: getSolicitacoesByDepartamento executado com sucesso")
    return solicitacoes
  } catch (error: any) {
    console.error("PRODUÇÃO REAL: Erro ao buscar solicitações por departamento:", error)
    return []
  }
}

// Buscar solicitações por usuário
export async function getSolicitacoesByUsuario(email: string) {
  try {
    const solicitacoes = await SolicitacoesService.listarSolicitacoes({ solicitante: email })
    console.log("✅ PRODUÇÃO REAL: getSolicitacoesByUsuario executado com sucesso")
    return solicitacoes
  } catch (error: any) {
    console.error("PRODUÇÃO REAL: Erro ao buscar solicitações por usuário:", error)
    return []
  }
}

// Buscar solicitações pendentes
export async function getSolicitacoesPendentes() {
  try {
    const solicitacoes = await SolicitacoesService.listarSolicitacoes()
    const pendentes = solicitacoes.filter((s) => s.statusGeral === "pendente" || s.statusGeral === "parcial")
    console.log("✅ PRODUÇÃO REAL: getSolicitacoesPendentes executado com sucesso")
    return pendentes
  } catch (error: any) {
    console.error("PRODUÇÃO REAL: Erro ao buscar solicitações pendentes:", error)
    return []
  }
}

// Atualizar status de um prestador
export async function atualizarStatusPrestador(
  solicitacaoId: string,
  prestadorId: string,
  novoStatus: "aprovado" | "reprovado",
  justificativa?: string,
) {
  try {
    const resultado = await SolicitacoesService.avaliarPrestador(
      prestadorId,
      novoStatus,
      "Sistema", // Usar nome real do aprovador
      justificativa,
    )
    console.log("✅ PRODUÇÃO REAL: atualizarStatusPrestador executado com sucesso")
    return resultado
  } catch (error: any) {
    console.error("PRODUÇÃO REAL: Erro ao atualizar status do prestador:", error)
    throw error
  }
}
