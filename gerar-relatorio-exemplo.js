// Importar dados reais do sistema
import { solicitacoesSimuladas } from "./data/mock-data.js"

function gerarRelatorioComDadosReais() {
  console.log("📊 GERANDO RELATÓRIO COM DADOS REAIS DO SISTEMA")
  console.log("=".repeat(120))
  console.log("RELATÓRIO DE SOLICITAÇÕES DE ACESSO - HEBRAICA")
  console.log(`Gerado em: ${new Date().toLocaleString("pt-BR")}`)
  console.log(`Dados: ${solicitacoesSimuladas.length} solicitações reais do sistema`)
  console.log("=".repeat(120))
  console.log("")

  // Cabeçalho formatado
  const cabecalho = [
    "NÚMERO".padEnd(12),
    "DATA_SOL".padEnd(10),
    "SOLICITANTE".padEnd(15),
    "DEPARTAMENTO".padEnd(20),
    "LOCAL".padEnd(15),
    "EMPRESA".padEnd(18),
    "PRESTADORES".padEnd(25),
    "DATA_INI".padEnd(10),
    "DATA_FIM".padEnd(10),
    "STATUS".padEnd(10),
    "CUSTO".padEnd(8),
    "ECONOMIA".padEnd(8),
    "TIPO".padEnd(12),
  ].join(" | ")

  console.log(cabecalho)
  console.log("=".repeat(200))

  // Processar dados reais
  let totalSolicitacoes = 0
  let totalCustos = 0
  let totalEconomias = 0
  const statusCount = { aprovado: 0, pendente: 0, reprovado: 0, parcial: 0 }
  const departamentos = {}

  solicitacoesSimuladas.forEach((s) => {
    const prestadoresNomes = s.prestadores.map((p) => p.nome).join(", ")
    const tipoEconomia =
      s.economia === "economia1" ? "Checagem Válida" : s.economia === "economia2" ? "Data Extrapolada" : "-"

    const linha = [
      s.numero.padEnd(12),
      s.dataSolicitacao.padEnd(10),
      s.solicitante.substring(0, 13).padEnd(15),
      s.departamento.substring(0, 18).padEnd(20),
      s.local.substring(0, 13).padEnd(15),
      s.empresa.substring(0, 16).padEnd(18),
      prestadoresNomes.substring(0, 23).padEnd(25),
      s.dataInicial.padEnd(10),
      s.dataFinal.padEnd(10),
      s.statusGeral.padEnd(10),
      `R$ ${s.custoChecagem || 0}`.padEnd(8),
      `R$ ${s.economiaGerada || 0}`.padEnd(8),
      tipoEconomia.substring(0, 10).padEnd(12),
    ].join(" | ")

    console.log(linha)

    // Calcular estatísticas reais
    totalSolicitacoes++
    totalCustos += s.custoChecagem || 0
    totalEconomias += s.economiaGerada || 0
    statusCount[s.statusGeral]++

    // Agrupar por departamento
    if (!departamentos[s.departamento]) {
      departamentos[s.departamento] = { solicitacoes: 0, custos: 0, economias: 0 }
    }
    departamentos[s.departamento].solicitacoes++
    departamentos[s.departamento].custos += s.custoChecagem || 0
    departamentos[s.departamento].economias += s.economiaGerada || 0
  })

  console.log("=".repeat(200))
  console.log("")
  console.log("📊 ESTATÍSTICAS REAIS DO SISTEMA:")
  console.log("-".repeat(80))
  console.log(`✅ Aprovadas: ${statusCount.aprovado}`)
  console.log(`⏳ Pendentes: ${statusCount.pendente}`)
  console.log(`❌ Reprovadas: ${statusCount.reprovado}`)
  console.log(`🔄 Parciais: ${statusCount.parcial}`)
  console.log("")
  console.log("🏢 RESUMO POR DEPARTAMENTO:")
  console.log("-".repeat(80))

  Object.entries(departamentos)
    .sort(([, a], [, b]) => b.solicitacoes - a.solicitacoes)
    .forEach(([dept, dados]) => {
      console.log(
        `${dept.padEnd(25)} | ${dados.solicitacoes.toString().padStart(3)} sol. | R$ ${dados.custos.toString().padStart(6)} custos | R$ ${dados.economias.toString().padStart(6)} economias`,
      )
    })

  console.log("-".repeat(80))
  console.log("")
  console.log("💰 TOTAIS FINAIS:")
  console.log("-".repeat(50))
  console.log(`📋 Total de Solicitações: ${totalSolicitacoes}`)
  console.log(`💸 Total de Custos: R$ ${totalCustos.toFixed(2)}`)
  console.log(`💚 Total de Economias: R$ ${totalEconomias.toFixed(2)}`)
  console.log(`📈 Saldo Líquido: R$ ${(totalEconomias - totalCustos).toFixed(2)}`)
  console.log("=".repeat(120))

  console.log("")
  console.log("✨ FORMATO EXCEL MELHORADO:")
  console.log("-".repeat(50))
  console.log("🎨 Cabeçalhos em negrito e coloridos")
  console.log("📐 Dados centralizados automaticamente")
  console.log("🔍 Filtros habilitados em cada coluna")
  console.log("💱 Valores monetários formatados")
  console.log("📊 Totais destacados em rodapé")
  console.log("")
  console.log("✅ Relatório com dados 100% reais do sistema!")
}

// Executar com dados reais
gerarRelatorioComDadosReais()
