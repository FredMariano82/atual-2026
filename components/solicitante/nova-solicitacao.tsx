"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "../../contexts/auth-context"
import { SolicitacoesService } from "../../services/solicitacoes-service"
import { PrestadoresService } from "../../services/prestadores-service"
import AvisoPrazo from "./aviso-prazo"
import type { Prestador } from "../../types"
import { Plus, Trash2, AlertTriangle, User, FileSpreadsheet, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import UploadListaExcel from "./upload-lista-excel"
import ModalPreviaSolicitacao from "./modal-previa-solicitacao"
import FinalidadeSolicitacao from "./finalidade-solicitacao"

interface NovaSolicitacaoProps {
  dadosPrePreenchidos?: {
    tipoSolicitacao?: string
    finalidade?: string
    local?: string
    empresa?: string
    prestadores?: Array<{ id: string; nome: string; documento: string }>
    dataInicial?: string
    dataFinal?: string
  }
  onLimparDadosPrePreenchidos?: () => void
}

export default function NovaSolicitacao({
  dadosPrePreenchidos,
  onLimparDadosPrePreenchidos,
}: NovaSolicitacaoProps = {}) {
  const { usuario } = useAuth()
  const [aceitouPrazo, setAceitouPrazo] = useState(false)
  const [finalidade, setFinalidade] = useState<"servicos_gerais" | "eventos" | "">("")
  const [tipoSolicitacao] = useState<"checagem_liberacao">("checagem_liberacao")
  const [local, setLocal] = useState("")
  const [empresa, setEmpresa] = useState("")
  const [prestadores, setPrestadores] = useState<Prestador[]>([
    {
      id: `prestador_inicial_${Date.now()}`,
      nome: "",
      documento: "",
      documento2: "",
      empresa: "",
    },
  ])
  const [dataInicial, setDataInicial] = useState("")
  const [dataFinal, setDataFinal] = useState("")
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [alertaValidacao, setAlertaValidacao] = useState("")
  const [carregando, setCarregando] = useState(false)

  const [alertaDataUrgente, setAlertaDataUrgente] = useState("")
  const [mostrarOpcoesPrazo, setMostrarOpcoesPrazo] = useState(false)
  const [prosseguirUrgente, setProsseguirUrgente] = useState(false)

  const [alertasPrestadores, setAlertasPrestadores] = useState<Record<string, string>>({})

  // Novo estado para controlar as opções de prestador não encontrado
  const [prestadorNaoEncontrado, setPrestadorNaoEncontrado] = useState<Record<string, boolean>>({})

  // 🎯 ESTADOS PARA LÓGICA DE EMPRESA INTELIGENTE
  const [modoEmpresa, setModoEmpresa] = useState<"geral" | "especifica" | "nenhum">("nenhum")

  // Adicionar estado para controlar modal de upload
  const [mostrarUploadLista, setMostrarUploadLista] = useState(false)

  // 🎯 NOVOS ESTADOS PARA CORREÇÕES
  const [dadosVieramDoExcel, setDadosVieramDoExcel] = useState(false)

  const [mostrarModalPrevia, setMostrarModalPrevia] = useState(false)

  const dataAtual = new Date()

  const dadosAutomaticos = {
    solicitante: usuario?.nome || "",
    departamento: usuario?.departamento || "",
    dataHoraSolicitacao: dataAtual.toLocaleString("pt-BR"),
  }

  const adicionarPrestador = () => {
    // Gerar ID único baseado em timestamp para evitar conflitos
    const novoId = `prestador_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    setPrestadores([
      ...prestadores,
      {
        id: novoId,
        nome: "",
        documento: "",
        documento2: "",
        empresa: "",
      },
    ])
  }

  const removerPrestador = (id: string) => {
    console.log(`🗑️ Tentando remover prestador ID: ${id}`)
    console.log(
      `📊 Prestadores antes da remoção:`,
      prestadores.map((p) => ({ id: p.id, nome: p.nome })),
    )

    if (prestadores.length > 1) {
      const novosPrestadores = prestadores.filter((p) => p.id !== id)
      console.log(
        `📊 Prestadores após remoção:`,
        novosPrestadores.map((p) => ({ id: p.id, nome: p.nome })),
      )
      setPrestadores(novosPrestadores)

      // Remover alertas do prestador removido
      const novosAlertas = { ...alertasPrestadores }
      delete novosAlertas[id]
      setAlertasPrestadores(novosAlertas)

      // Remover estado de prestador não encontrado
      const novosPrestadorNaoEncontrado = { ...prestadorNaoEncontrado }
      delete novosPrestadorNaoEncontrado[id]
      setPrestadorNaoEncontrado(novosPrestadorNaoEncontrado)
    } else {
      console.log(`⚠️ Não é possível remover - deve ter pelo menos 1 prestador`)
    }
  }

  const atualizarPrestador = (id: string, campo: "nome" | "documento" | "documento2" | "empresa", valor: string) => {
    console.log(`🔄 Atualizando prestador ID ${id}, campo ${campo}: "${valor}"`)

    const novosPrestadores = prestadores.map((p) => (p.id === id ? { ...p, [campo]: valor } : p))
    setPrestadores(novosPrestadores)

    // 🎯 LÓGICA INTELIGENTE DE EMPRESA - EXCLUSÃO MÚTUA
    if (campo === "empresa") {
      if (valor.trim() !== "" && modoEmpresa !== "especifica") {
        // Primeira empresa específica preenchida - mudar para modo específico
        console.log("🏢 Mudando para modo ESPECÍFICO - desabilitando empresa geral")
        setModoEmpresa("especifica")
      } else if (valor.trim() === "") {
        // Verificar se ainda há empresas específicas preenchidas
        const temOutrasEmpresasEspecificas = novosPrestadores.some((p) => p.id !== id && p.empresa?.trim())
        if (!temOutrasEmpresasEspecificas) {
          console.log("🏢 Nenhuma empresa específica - voltando para modo nenhum")
          setModoEmpresa("nenhum")
        }
      }
    }

    // APENAS limpar alertas se o campo foi esvaziado - SEM VALIDAÇÃO DURANTE DIGITAÇÃO
    if (campo === "documento" && !valor.trim()) {
      console.log(`🧹 Documento vazio, limpando alertas para prestador ID ${id}`)
      const novosAlertas = { ...alertasPrestadores }
      delete novosAlertas[id]
      setAlertasPrestadores(novosAlertas)

      const novosPrestadorNaoEncontrado = { ...prestadorNaoEncontrado }
      delete novosPrestadorNaoEncontrado[id]
      setPrestadorNaoEncontrado(novosPrestadorNaoEncontrado)
    } else if (campo === "nome" && !valor.trim()) {
      console.log(`🧹 Nome vazio, limpando alertas para prestador ID ${id}`)
      const novosAlertas = { ...alertasPrestadores }
      delete novosAlertas[id]
      setAlertasPrestadores(novosAlertas)

      const novosPrestadorNaoEncontrado = { ...prestadorNaoEncontrado }
      delete novosPrestadorNaoEncontrado[id]
      setPrestadorNaoEncontrado(novosPrestadorNaoEncontrado)
    }
  }

  // 🎯 FUNÇÃO PARA ATUALIZAR EMPRESA GERAL COM LÓGICA INTELIGENTE
  const atualizarEmpresaGeral = (valor: string) => {
    setEmpresa(valor)

    // 🎯 LÓGICA INTELIGENTE DE EMPRESA - EXCLUSÃO MÚTUA
    if (valor.trim() !== "" && modoEmpresa !== "geral") {
      // Empresa geral preenchida - mudar para modo geral
      console.log("🏢 Mudando para modo GERAL - desabilitando empresas específicas")
      setModoEmpresa("geral")
      // Limpar todas as empresas específicas
      const novosPrestadores = prestadores.map((p) => ({ ...p, empresa: "" }))
      setPrestadores(novosPrestadores)
    } else if (valor.trim() === "") {
      // Empresa geral esvaziada
      console.log("🏢 Empresa geral esvaziada - voltando para modo nenhum")
      setModoEmpresa("nenhum")
    }
  }

  // Função para validar quando sair do campo documento (onBlur)
  const validarAoSairDoCampo = (prestadorId: string) => {
    const prestador = prestadores.find((p) => p.id === prestadorId)

    console.log(`🔍 VALIDAÇÃO Doc1 - Prestador ID: ${prestadorId}`)
    console.log(`📝 Dados do prestador:`, prestador)
    console.log(`📋 Tipo de solicitação: ${tipoSolicitacao}`)

    // MUDANÇA: Validar se tem documento (não precisa de nome preenchido)
    if (prestador && prestador.documento.trim() && finalidade) {
      const documentoParaValidar = prestador.documento.trim()
      console.log(`🔍 VALIDAÇÃO ACIONADA - Documento para validar: "${documentoParaValidar}"`)
      validarPrestador(prestadorId, prestador.nome, documentoParaValidar)
    } else {
      console.log(`⚠️ Validação não executada - documento vazio ou tipo não selecionado`)
      console.log(`   Doc1: "${prestador?.documento || ""}"`)
      console.log(`   Tipo: "${tipoSolicitacao}"`)
    }
  }

  // Função para incluir checagem e prosseguir
  const incluirChecagemEProsseguir = (prestadorId: string) => {
    console.log(`🔄 Incluindo checagem para prestador ID ${prestadorId}`)

    // Mudar tipo de solicitação para checagem + liberação
    //setTipoSolicitacao("checagem_liberacao")

    // Remover o estado de prestador não encontrado
    const novosPrestadorNaoEncontrado = { ...prestadorNaoEncontrado }
    delete novosPrestadorNaoEncontrado[prestadorId]
    setPrestadorNaoEncontrado(novosPrestadorNaoEncontrado)

    // Revalidar o prestador com o novo tipo
    const prestador = prestadores.find((p) => p.id === prestadorId)
    if (prestador) {
      // A revalidação será feita automaticamente pelo useEffect quando tipoSolicitacao mudar
    }
  }

  // Função para não avançar (limpar campos)
  const naoAvancar = (prestadorId: string) => {
    console.log(`🧹 Não avançar - limpando campos do prestador ID ${prestadorId}`)

    // Limpar nome e documento do prestador
    const novosPrestadores = prestadores.map((p) => (p.id === prestadorId ? { ...p, nome: "", documento: "" } : p))
    setPrestadores(novosPrestadores)

    // Limpar alertas
    const novosAlertas = { ...alertasPrestadores }
    delete novosAlertas[prestadorId]
    setAlertasPrestadores(novosAlertas)

    // Remover estado de prestador não encontrado
    const novosPrestadorNaoEncontrado = { ...prestadorNaoEncontrado }
    delete novosPrestadorNaoEncontrado[prestadorId]
    setPrestadorNaoEncontrado(novosPrestadorNaoEncontrado)
  }

  // Função para validar um único prestador pelo ID (CONSULTA SUPABASE EM TEMPO REAL)
  const validarPrestador = async (id: string, nome: string, documento: string) => {
    console.log(`\n🔍 === VALIDANDO PRESTADOR ID ${id} (PRODUÇÃO SUPABASE) ===`)
    console.log(`📝 Nome: "${nome}"`)
    console.log(`📄 Documento: "${documento}"`)

    // MUDANÇA: Só exigir documento preenchido (nome pode estar vazio)
    if (!documento.trim()) {
      console.log(`⚠️ Documento vazio - não validar`)
      // Limpar qualquer alerta existente
      const novosAlertas = { ...alertasPrestadores }
      delete novosAlertas[id]
      setAlertasPrestadores(novosAlertas)
      return
    }

    try {
      // 🚀 CONSULTAR SUPABASE EM PRODUÇÃO
      console.log(`🚀 PRODUÇÃO - Consultando Supabase para documento: "${documento}"`)
      const prestadorEncontrado = await PrestadoresService.consultarPrestadorPorDocumento(documento)
      console.log(`🚀 PRODUÇÃO - Resultado da consulta:`, prestadorEncontrado)

      // Se encontrou prestador com este documento
      if (prestadorEncontrado) {
        console.log(`✅ Prestador encontrado no Supabase: ${prestadorEncontrado.nome}`)

        // AUTO-PREENCHER O NOME APENAS
        if (prestadorEncontrado && prestadorEncontrado.nome) {
          console.log(`🎯 Auto-preenchendo nome: ${prestadorEncontrado.nome}`)
          const novosPrestadores = prestadores.map((p) => (p.id === id ? { ...p, nome: prestadorEncontrado.nome } : p))
          setPrestadores(novosPrestadores)
        }
      } else {
        console.log(`❌ Prestador não encontrado no banco Supabase`)
      }

      // REMOVER QUALQUER ALERTA EXISTENTE - NÃO MOSTRAR NADA
      const novosAlertas = { ...alertasPrestadores }
      delete novosAlertas[id]
      setAlertasPrestadores(novosAlertas)
    } catch (error) {
      console.error("💥 PRODUÇÃO - Erro ao validar prestador:", error)
      // MESMO EM CASO DE ERRO, NÃO MOSTRAR ALERTA
      const novosAlertas = { ...alertasPrestadores }
      delete novosAlertas[id]
      setAlertasPrestadores(novosAlertas)
    }
  }
  const validarTodosPrestadores = () => {
    console.log(`\n🔄 PRODUÇÃO - Revalidando todos os prestadores`)

    // 🎯 CORREÇÃO: Filtrar prestadores que têm nome E pelo menos um documento (Doc1 OU Doc2)
    const prestadoresCompletos = prestadores.filter((p) => {
      const temNome = p.nome.trim()
      const temDoc1 = p.documento.trim()
      const temDoc2 = p.documento2?.trim()
      const temAlgumDoc = temDoc1 || temDoc2

      console.log(
        `🔍 PRODUÇÃO - Prestador ${p.nome}: Nome="${temNome}" Doc1="${temDoc1}" Doc2="${temDoc2}" TemAlgumDoc=${!!temAlgumDoc}`,
      )

      return temNome && temAlgumDoc
    })

    console.log(`📊 PRODUÇÃO - Prestadores completos para validar: ${prestadoresCompletos.length}`)
    prestadoresCompletos.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.nome} - ID: ${p.id}`)
    })

    // 🎯 CORREÇÃO CRÍTICA: Criar mapa de prestadores únicos por documento
    const prestadoresUnicos = new Map<string, (typeof prestadoresCompletos)[0]>()

    prestadoresCompletos.forEach((prestador) => {
      const documentoParaValidar = prestador.documento.trim() || prestador.documento2?.trim() || ""

      if (documentoParaValidar && !prestadoresUnicos.has(documentoParaValidar)) {
        prestadoresUnicos.set(documentoParaValidar, prestador)
        console.log(`🎯 ÚNICO - Adicionado: ${prestador.nome} com documento: ${documentoParaValidar}`)
      } else if (documentoParaValidar) {
        console.log(`⚠️ DUPLICATA IGNORADA - ${prestador.nome} com documento: ${documentoParaValidar}`)
      }
    })

    console.log(`🎯 PRODUÇÃO - Prestadores únicos para validar: ${prestadoresUnicos.size}`)

    // Limpar todos os alertas ANTES de validar
    setAlertasPrestadores({})
    setPrestadorNaoEncontrado({})

    // 🎯 CORREÇÃO: Validar apenas prestadores únicos
    const prestadoresArray = Array.from(prestadoresUnicos.values())
    prestadoresArray.forEach((p, index) => {
      const documentoParaValidar = p.documento.trim() || p.documento2?.trim() || ""
      console.log(
        `🔍 VALIDAÇÃO PRODUÇÃO - ${index + 1}/${prestadoresArray.length}: ${p.nome} com documento: "${documentoParaValidar}"`,
      )

      // Adicionar delay progressivo para evitar problemas de concorrência
      setTimeout(() => {
        validarPrestador(p.id, p.nome, documentoParaValidar)
      }, index * 300) // 300ms entre cada validação
    })
  }

  const verificarDataUrgente = (dataInicial: string) => {
    // CORREÇÃO DEFINITIVA: Usar data local brasileira SEMPRE
    const agora = new Date()
    // Forçar uso do fuso horário local (não UTC)
    const hojeLocal = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const hojeFormatado = `${hojeLocal.getFullYear()}-${String(hojeLocal.getMonth() + 1).padStart(2, "0")}-${String(hojeLocal.getDate()).padStart(2, "0")}`

    console.log(`📅 DEBUG CORRIGIDO - Data atual LOCAL: ${hojeFormatado}`)
    console.log(`📅 DEBUG CORRIGIDO - Data inicial selecionada: ${dataInicial}`)
    console.log(`📅 DEBUG CORRIGIDO - Horário atual: ${agora.toLocaleString("pt-BR")}`)

    if (dataInicial < hojeFormatado) {
      console.log(`⚠️ Data inicial é ANTERIOR à data atual LOCAL`)
      setAlertaDataUrgente(
        "Atenção: A data inicial selecionada é anterior à data atual. Verifique se a data está correta.",
      )
      setMostrarOpcoesPrazo(true)
      return false
    }

    if (dataInicial === hojeFormatado) {
      console.log(`⚠️ Data inicial é IGUAL à data atual LOCAL (urgente)`)
      setAlertaDataUrgente(
        "Atenção, a data da solicitação é idêntica à data inicial do acesso. Isso vai contra o prazo mínimo estipulado para a aprovação.",
      )
      setMostrarOpcoesPrazo(true)
      return false
    }

    console.log(`✅ Data inicial está OK (futura em relação ao horário LOCAL)`)
    setAlertaDataUrgente("")
    setMostrarOpcoesPrazo(false)
    setProsseguirUrgente(false)
    return true
  }

  const validarFormulario = () => {
    if (!aceitouPrazo) return "Você deve aceitar o prazo de análise para continuar"
    if (!finalidade) return "Você deve selecionar a finalidade da solicitação"
    if (!local.trim()) return "Local específico é obrigatório"

    if (!empresa.trim() && modoEmpresa !== "especifica") return "Empresa prestadora é obrigatória"

    if (!dataInicial) return "Data inicial é obrigatória"
    if (!dataFinal) return "Data final é obrigatória"

    // Substituir a validação atual dos prestadores por:
    for (const prestador of prestadores) {
      if (!prestador.nome.trim()) {
        return "Todos os prestadores devem ter nome preenchido"
      }
      if (!prestador.documento.trim() && !prestador.documento2?.trim()) {
        return "Todos os prestadores devem ter pelo menos um documento preenchido (Doc1 ou Doc2)"
      }
    }

    // Validar empresas específicas se estiver no modo específico
    if (modoEmpresa === "especifica") {
      for (const prestador of prestadores) {
        if (!prestador.empresa?.trim()) {
          return "No modo empresas específicas, todos os prestadores devem ter empresa preenchida"
        }
      }
    }

    if (new Date(dataFinal) < new Date(dataInicial)) {
      return "Data final deve ser posterior à data inicial"
    }

    // CORREÇÃO DEFINITIVA: Usar data local brasileira SEMPRE
    const agora = new Date()
    const hojeLocal = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate())
    const hojeFormatado = `${hojeLocal.getFullYear()}-${String(hojeLocal.getMonth() + 1).padStart(2, "0")}-${String(hojeLocal.getDate()).padStart(2, "0")}`

    if (dataInicial === hojeFormatado && !prosseguirUrgente) {
      return "Confirme se deseja prosseguir com a solicitação urgente ou corrija a data inicial"
    }

    // Verificar se há prestadores não encontrados pendentes de decisão
    if (Object.keys(prestadorNaoEncontrado).length > 0) {
      return "Resolva as pendências dos prestadores não encontrados antes de enviar a solicitação"
    }

    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setSucesso("")

    const erroValidacao = validarFormulario()
    if (erroValidacao) {
      setErro(erroValidacao)
      return
    }

    // Abrir modal de prévia ao invés de enviar diretamente
    setMostrarModalPrevia(true)
  }

  const confirmarEnvioAposModal = async (economias: any[]) => {
    if (!usuario) return

    setCarregando(true)

    try {
      console.log("🚀 ENVIANDO SOLICITAÇÃO + CONTABILIZANDO ECONOMIAS")

      // 🎯 FILTRAR APENAS PRESTADORES SEM ECONOMIA
      const prestadoresSemEconomia = prestadores.filter((prestador) => {
        const economia = economias.find((e) => e.prestadorId === prestador.id)
        return !economia || economia.tipoEconomia === "nenhuma"
      })

      console.log(`📊 Total de prestadores: ${prestadores.length}`)
      console.log(`📊 Prestadores com economia: ${economias.filter((e) => e.tipoEconomia !== "nenhuma").length}`)
      console.log(`📊 Prestadores para enviar: ${prestadoresSemEconomia.length}`)

      // Se não há prestadores para enviar, só contabilizar economias
      if (prestadoresSemEconomia.length === 0) {
        console.log("⚠️ Todos os prestadores têm economia - apenas contabilizando")

        setSucesso(
          `Todas as economias foram contabilizadas! Nenhuma solicitação foi enviada pois todos os prestadores já estão em situação adequada.`,
        )
        setMostrarModalPrevia(false)

        // Limpar formulário
        setTimeout(() => {
          setLocal("")
          setEmpresa("")
          setPrestadores([
            { id: `prestador_inicial_${Date.now()}`, nome: "", documento: "", documento2: "", empresa: "" },
          ])
          setDataInicial("")
          setDataFinal("")
          setSucesso("")
          setAceitouPrazo(false)
          setFinalidade("")
          setModoEmpresa("nenhum")
        }, 4000)

        return
      }

      // Determinar empresa final para cada prestador SEM economia
      const prestadoresComEmpresa = prestadoresSemEconomia.map((p) => {
        let empresaFinal = ""
        if (modoEmpresa === "geral") {
          empresaFinal = empresa
        } else if (modoEmpresa === "especifica") {
          empresaFinal = p.empresa || ""
        }
        return {
          nome: p.nome,
          documento: p.documento,
          documento2: p.documento2,
          empresa: empresaFinal,
        }
      })

      const empresaSolicitacao = modoEmpresa === "geral" ? empresa : prestadoresComEmpresa[0]?.empresa || ""

      // Criar solicitação APENAS com prestadores sem economia
      const {
        sucesso: sucessoEnvio,
        erro: erroEnvio,
        solicitacao,
      } = await SolicitacoesService.criarSolicitacao({
        solicitante: usuario.nome,
        departamento: usuario.departamento,
        usuarioId: usuario.id,
        tipoSolicitacao: "checagem_liberacao",
        finalidade,
        local,
        empresa: empresaSolicitacao,
        prestadores: prestadoresComEmpresa,
        dataInicial: dataInicial,
        dataFinal: dataFinal,
      })

      if (sucessoEnvio && solicitacao) {
        const prestadoresEnviados = prestadoresSemEconomia.length

        setSucesso(`Solicitação ${solicitacao.numero} enviada com ${prestadoresEnviados} prestador(es)!`)
        setMostrarModalPrevia(false)

        // Limpar formulário após sucesso
        setTimeout(() => {
          setLocal("")
          setEmpresa("")
          setPrestadores([
            { id: `prestador_inicial_${Date.now()}`, nome: "", documento: "", documento2: "", empresa: "" },
          ])
          setDataInicial("")
          setDataFinal("")
          setSucesso("")
          setAceitouPrazo(false)
          setFinalidade("")
          setModoEmpresa("nenhum")
        }, 4000)
      } else {
        setErro(erroEnvio || "Erro ao criar solicitação")
        setMostrarModalPrevia(false)
      }
    } catch (error) {
      console.error("💥 Erro:", error)
      setErro("Erro inesperado ao enviar solicitação")
      setMostrarModalPrevia(false)
    } finally {
      setCarregando(false)
    }
  }

  // Revalidar prestadores quando mudar o tipo de solicitação OU data final
  useEffect(() => {
    if (dadosPrePreenchidos) {
      if (dadosPrePreenchidos.tipoSolicitacao) {
        //setTipoSolicitacao(dadosPrePreenchidos.tipoSolicitacao as "checagem_liberacao" | "somente_liberacao")
      }
      if (dadosPrePreenchidos.finalidade) {
        setFinalidade(dadosPrePreenchidos.finalidade as "servicos_gerais" | "eventos")
      }
      if (dadosPrePreenchidos.local) {
        setLocal(dadosPrePreenchidos.local)
      }
      if (dadosPrePreenchidos.empresa) {
        setEmpresa(dadosPrePreenchidos.empresa)
      }
      if (dadosPrePreenchidos.prestadores && dadosPrePreenchidos.prestadores.length > 0) {
        setPrestadores(dadosPrePreenchidos.prestadores)
      }
      if (dadosPrePreenchidos.dataInicial) {
        setDataInicial(dadosPrePreenchidos.dataInicial)
      }
      if (dadosPrePreenchidos.dataFinal) {
        setDataFinal(dadosPrePreenchidos.dataFinal)
      }

      // Aceitar automaticamente o prazo se for renovação
      setAceitouPrazo(true)

      // Limpar dados após aplicar
      if (onLimparDadosPrePreenchidos) {
        onLimparDadosPrePreenchidos()
      }
    }
  }, [dadosPrePreenchidos, onLimparDadosPrePreenchidos])

  // Função para validar quando sair do campo Doc2 (onBlur)
  const validarAoSairDoCampoDoc2 = (prestadorId: string) => {
    const prestador = prestadores.find((p) => p.id === prestadorId)

    console.log(`🔍 VALIDAÇÃO Doc2 - Prestador ID: ${prestadorId}`)
    console.log(`📝 Dados do prestador:`, prestador)
    console.log(`📋 Tipo de solicitação: ${tipoSolicitacao}`)

    // MUDANÇA: Validar se tem documento2 (não precisa de nome preenchido)
    if (prestador && prestador.documento2?.trim() && finalidade) {
      const documentoParaValidar = prestador.documento2.trim()
      console.log(`🔍 VALIDAÇÃO ACIONADA Doc2 - Documento para validar: "${documentoParaValidar}"`)
      validarPrestador(prestadorId, prestador.nome, documentoParaValidar)
    } else {
      console.log(`⚠️ Validação Doc2 não executada - documento2 vazio ou tipo não selecionado`)
      console.log(`   Doc2: "${prestador?.documento2 || ""}"`)
      console.log(`   Tipo: "${tipoSolicitacao}"`)
    }
  }

  // Adicionar função para processar lista do Excel
  const processarListaExcel = (prestadoresExcel: any[]) => {
    console.log(`📝 EXCEL LIMPO - Processando ${prestadoresExcel.length} prestadores`)

    const novosPrestadores = prestadoresExcel.map((p, index) => ({
      id: `excel_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
      nome: p.nome || "",
      documento: p.documento || "",
      documento2: p.documento2 || "",
      empresa: p.empresa || "",
    }))

    setPrestadores(novosPrestadores)
    setMostrarUploadLista(false)

    // Lógica de empresa (mantida)
    const empresasEspecificas = prestadoresExcel.filter((p) => p.empresa?.trim())
    const empresasUnicas = [...new Set(prestadoresExcel.map((p) => p.empresa).filter(Boolean))]

    if (empresasEspecificas.length > 0) {
      setModoEmpresa("especifica")
      setEmpresa("")
    } else if (empresasUnicas.length === 1) {
      setEmpresa(empresasUnicas[0])
      setModoEmpresa("geral")
    }

    console.log(`✅ EXCEL LIMPO - ${novosPrestadores.length} prestadores carregados SEM validações`)
  }

  // 🎯 CORREÇÃO: VALIDAÇÃO AUTOMÁTICA APÓS UPLOAD EXCEL

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 space-y-6">
      <AvisoPrazo aceitou={aceitouPrazo} onAceitar={setAceitouPrazo} />

      {aceitouPrazo && <FinalidadeSolicitacao onFinalidadeChange={setFinalidade} finalidadeSelecionada={finalidade} />}

      {finalidade && mostrarUploadLista && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">Upload de Lista Excel</h2>
              <Button onClick={() => setMostrarUploadLista(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <UploadListaExcel onListaProcessada={processarListaExcel} />
            </div>
          </div>
        </div>
      )}

      {finalidade && (
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-slate-800 text-center">Nova Solicitação de Acesso</CardTitle>
            <div className="w-24 h-1 bg-slate-600 mx-auto rounded-full"></div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-slate-700">Nome do Solicitante</Label>
                  <Input value={dadosAutomaticos.solicitante} disabled className="bg-slate-50 text-slate-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Departamento</Label>
                  <Input value={dadosAutomaticos.departamento} disabled className="bg-slate-50 text-slate-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-slate-700">Data e Hora da Solicitação</Label>
                  <Input value={dadosAutomaticos.dataHoraSolicitacao} disabled className="bg-slate-50 text-slate-600" />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="local" className="text-sm font-medium text-slate-700">
                    Local / Evento *
                  </Label>
                  <Input
                    id="local"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Piscina, Quadra de Tênis, Evento Corporativo"
                    className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="empresa" className="text-sm font-medium text-slate-700">
                    Empresa Prestadora
                  </Label>
                  <Input
                    id="empresa"
                    value={empresa}
                    onChange={(e) => atualizarEmpresaGeral(e.target.value)}
                    disabled={modoEmpresa === "especifica"}
                    placeholder={
                      modoEmpresa === "especifica"
                        ? "Desabilitado - usando empresas específicas"
                        : "Nome da empresa (se todos forem da mesma empresa)"
                    }
                    className={`border-slate-300 focus:border-slate-600 focus:ring-slate-600 ${modoEmpresa === "especifica" ? "bg-slate-100 text-slate-500" : ""}`}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-medium text-slate-700">Prestadores</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => setMostrarUploadLista(true)}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-600 hover:bg-slate-50"
                    >
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      Upload Excel
                    </Button>
                    <Button
                      type="button"
                      onClick={adicionarPrestador}
                      variant="outline"
                      size="sm"
                      className="border-slate-600 text-slate-600 hover:bg-slate-50"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Prestador
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* 🎯 ALERTA EXPLICATIVO INTELIGENTE */}
                  <Alert className="mb-4 border-blue-200 bg-blue-50">
                    <User className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      <div className="space-y-2">
                        <p>
                          <strong>🔍 Busca Dupla + Auto-preenchimento:</strong> Preencha Doc1 ou Doc2. O sistema buscará
                          em ambas as colunas do banco e preencherá automaticamente o nome quando encontrar o prestador.
                        </p>
                        <p>
                          <strong>🏢 Modo Empresa:</strong> Preencha a empresa geral OU as empresas específicas (não
                          ambos)
                        </p>
                      </div>
                    </AlertDescription>
                  </Alert>

                  {prestadores.map((prestador, index) => (
                    <div key={prestador.id} className="space-y-3">
                      {/* Grid com 5 colunas */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                        {/* Nome */}
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Nome</Label>
                          <Input
                            value={prestador.nome}
                            onChange={(e) => atualizarPrestador(prestador.id, "nome", e.target.value)}
                            placeholder="Nome completo (auto-preenchido)"
                            className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                          />
                        </div>

                        {/* Doc1 */}
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Doc1 (RG, etc)</Label>
                          <Input
                            value={prestador.documento}
                            onChange={(e) => atualizarPrestador(prestador.id, "documento", e.target.value)}
                            onBlur={() => validarAoSairDoCampo(prestador.id)}
                            placeholder="RG, etc"
                            className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                          />
                        </div>

                        {/* Doc2 */}
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Doc2 (CPF, CNH, etc)</Label>
                          <Input
                            value={prestador.documento2 || ""}
                            onChange={(e) => atualizarPrestador(prestador.id, "documento2", e.target.value)}
                            onBlur={() => validarAoSairDoCampoDoc2(prestador.id)}
                            placeholder="CPF, CNH, etc"
                            className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                          />
                        </div>

                        {/* 🎯 EMPRESA ESPECÍFICA INTELIGENTE */}
                        <div>
                          <Label className="text-sm font-medium text-slate-700">Empresa</Label>
                          <Input
                            value={prestador.empresa || ""}
                            onChange={(e) => atualizarPrestador(prestador.id, "empresa", e.target.value)}
                            disabled={modoEmpresa === "geral"}
                            placeholder={
                              modoEmpresa === "geral" ? "Desabilitado - usando empresa geral" : "Empresa específica"
                            }
                            className={`border-slate-300 focus:border-slate-600 focus:ring-slate-600 ${modoEmpresa === "geral" ? "bg-slate-100 text-slate-500" : ""}`}
                          />
                        </div>

                        {/* Botão remover */}
                        <div>
                          {prestadores.length > 1 && (
                            <Button
                              type="button"
                              onClick={() => removerPrestador(prestador.id)}
                              variant="outline"
                              size="icon"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* 🎯 INDICAÇÃO INTELIGENTE */}
                      <div className="text-xs text-slate-500 ml-1">
                        💡 Preencha pelo menos Doc1 ou Doc2 | 🏢 Escolha: empresa geral OU específicas
                      </div>

                      {/* REMOVER TODA ESTA SEÇÃO DE ALERTAS */}
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicial" className="text-sm font-medium text-slate-700">
                    Data Inicial do Acesso *
                  </Label>
                  <Input
                    id="dataInicial"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => {
                      setDataInicial(e.target.value)
                      verificarDataUrgente(e.target.value)
                    }}
                    className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                  />
                </div>
                <div>
                  <Label htmlFor="dataFinal" className="text-sm font-medium text-slate-700">
                    Data Final do Acesso *
                  </Label>
                  <Input
                    id="dataFinal"
                    type="date"
                    value={dataFinal}
                    onChange={(e) => {
                      setDataFinal(e.target.value)
                      // A revalidação será feita pelo useEffect quando dataFinal mudar
                    }}
                    className="border-slate-300 focus:border-slate-600 focus:ring-slate-600"
                  />
                </div>
              </div>

              {alertaValidacao && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">{alertaValidacao}</AlertDescription>
                </Alert>
              )}

              {erro && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{erro}</AlertDescription>
                </Alert>
              )}

              {sucesso && (
                <Alert className="border-green-200 bg-green-50">
                  <AlertDescription className="text-green-700">{sucesso}</AlertDescription>
                </Alert>
              )}

              {alertaDataUrgente && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-700">
                    <div className="space-y-3">
                      <p>{alertaDataUrgente}</p>
                      {mostrarOpcoesPrazo && (
                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setProsseguirUrgente(true)
                              setMostrarOpcoesPrazo(false)
                            }}
                            className="border-orange-600 text-orange-600 hover:bg-orange-50"
                          >
                            {dataInicial < new Date().toISOString().split("T")[0]
                              ? "Prosseguir mesmo assim, a data está correta"
                              : "Prosseguir mesmo assim, pois solicitação é de caráter urgente"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setDataInicial("")
                              setAlertaDataUrgente("")
                              setMostrarOpcoesPrazo(false)
                              setProsseguirUrgente(false)
                            }}
                            className="border-slate-600 text-slate-600 hover:bg-slate-50"
                          >
                            Selecionei data inicial errada, vou corrigir
                          </Button>
                        </div>
                      )}
                      {prosseguirUrgente && (
                        <div className="p-2 bg-orange-100 rounded text-sm">
                          ✓ Confirmado: Solicitação de caráter urgente (será marcada automaticamente no cadastro)
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-2"
                  disabled={carregando}
                >
                  {carregando ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
      {/* Modal de Prévia */}
      {mostrarModalPrevia && (
        <ModalPreviaSolicitacao
          isOpen={mostrarModalPrevia}
          onClose={() => setMostrarModalPrevia(false)}
          onConfirmar={confirmarEnvioAposModal}
          prestadores={prestadores}
          tipoSolicitacao={tipoSolicitacao}
          dataInicial={dataInicial}
          dataFinal={dataFinal}
          solicitante={usuario?.nome || ""}
          departamento={usuario?.departamento || ""}
          local={local}
          empresa={empresa}
        />
      )}
    </div>
  )
}
