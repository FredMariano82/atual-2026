import type { PrestadorHistorico } from "../types"

// Base de dados REAL dos prestadores (vazia inicialmente)
export const prestadoresHistorico: PrestadorHistorico[] = [
  // Base vazia - prestadores serão adicionados conforme aprovações reais
]

// Função para consultar um prestador APENAS pelo documento
export function consultarPrestadorPorDocumento(documento: string): PrestadorHistorico | null {
  if (!documento || documento.trim() === "") {
    console.log("❌ Documento vazio ou nulo")
    return null
  }

  // Limpar o documento de busca (remover tudo que não for número)
  const documentoLimpo = documento.replace(/\D/g, "")
  console.log(`🔍 BUSCA - Documento original: "${documento}" -> limpo: "${documentoLimpo}"`)

  // Verificar se o documento limpo está vazio
  if (documentoLimpo === "") {
    console.log("❌ Documento limpo está vazio")
    return null
  }

  // Buscar prestador com documento exatamente igual (após limpeza)
  const prestadorEncontrado = prestadoresHistorico.find((p) => {
    const pDocLimpo = p.documento.replace(/\D/g, "")
    return pDocLimpo === documentoLimpo
  })

  if (!prestadorEncontrado) {
    console.log(`❌ Nenhum prestador encontrado com documento limpo: "${documentoLimpo}"`)
  } else {
    console.log(`✅ MATCH ENCONTRADO! Prestador: ${prestadorEncontrado.nome} (${prestadorEncontrado.documento})`)
  }

  return prestadorEncontrado || null
}

// Função para verificar se um prestador existe com o nome informado
export function existePrestadorComNome(nome: string): boolean {
  if (!nome || nome.trim() === "") {
    return false
  }

  const nomeNormalizado = nome.toLowerCase().trim()

  return prestadoresHistorico.some((p) => {
    const pNomeNormalizado = p.nome.toLowerCase().trim()
    return pNomeNormalizado === nomeNormalizado
  })
}

// Função para verificar status da checagem de um prestador
export function verificarStatusChecagem(prestador: PrestadorHistorico): "valido" | "vencido" | "sem_historico" {
  if (!prestador.validadeChecagem) {
    return "sem_historico"
  }

  const hoje = new Date()
  const [dia, mes, ano] = prestador.validadeChecagem.split("/").map(Number)
  const dataValidade = new Date(ano, mes - 1, dia)

  if (hoje > dataValidade) {
    return "vencido"
  }

  return "valido"
}

// Função legacy para compatibilidade
export function consultarPrestador(documento: string): PrestadorHistorico {
  const prestador = consultarPrestadorPorDocumento(documento)

  if (!prestador) {
    return {
      documento,
      nome: "",
      status: "sem_historico",
    }
  }

  if (!prestador.validadeChecagem) {
    return {
      ...prestador,
      status: "sem_historico",
    }
  }

  const hoje = new Date()
  const [dia, mes, ano] = prestador.validadeChecagem.split("/").map(Number)
  const dataValidade = new Date(ano, mes - 1, dia)

  if (hoje > dataValidade) {
    return {
      ...prestador,
      status: "vencido",
    }
  }

  return {
    ...prestador,
    status: "valido",
  }
}

// Função para calcular a data de validade da checagem (6 meses após aprovação)
export function calcularValidadeChecagem(dataAprovacao: string): string {
  if (!dataAprovacao) return ""

  const [dia, mes, ano] = dataAprovacao.split("/").map(Number)
  const data = new Date(ano, mes - 1, dia)
  data.setMonth(data.getMonth() + 6)

  const diaFormatado = String(data.getDate()).padStart(2, "0")
  const mesFormatado = String(data.getMonth() + 1).padStart(2, "0")
  const anoFormatado = data.getFullYear()

  return `${diaFormatado}/${mesFormatado}/${anoFormatado}`
}
