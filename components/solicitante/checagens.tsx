"use client"

import { useState, useEffect } from "react"
import { Search, CheckCircle, XCircle, Clock, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "../../contexts/auth-context"
import { getSolicitacoesByDepartamento } from "../../services/solicitacoes-service"
import { formatarDataParaBR } from "../../utils/date-helpers"
import { getChecagemStatus, getCadastroStatus } from "../ui/status-badges"
import { Button } from "@/components/ui/button"

export default function Checagens() {
  const { usuario } = useAuth()
  const [buscaGeral, setBuscaGeral] = useState<string>("")
  const [solicitacoesReais, setSolicitacoesReais] = useState<any[]>([])
  const [carregando, setCarregando] = useState(true)
  const [paginaAtual, setPaginaAtual] = useState(1)
  const PRESTADORES_POR_PAGINA = 10

  const buscarSolicitacoesDepartamento = async () => {
    try {
      setCarregando(true)
      if (usuario?.departamento) {
        const solicitacoes = await getSolicitacoesByDepartamento(usuario.departamento)
        setSolicitacoesReais(solicitacoes)
      }
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error)
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    buscarSolicitacoesDepartamento()
  }, [usuario?.departamento])

  // Resetar página quando filtros mudarem
  useEffect(() => {
    setPaginaAtual(1)
  }, [buscaGeral])

  if (carregando) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  // Filtrar e organizar dados por status de checagem
  const dadosPorStatus = solicitacoesReais
    .filter((solicitacao) => solicitacao.departamento === usuario?.departamento)
    .filter((solicitacao) =>
      solicitacao.prestadores.some((p: any) => getCadastroStatus(p, solicitacao.dataFinal) === "ok"),
    )
    .flatMap((solicitacao) =>
      solicitacao.prestadores
        .filter((prestador: any) => getCadastroStatus(prestador, solicitacao.dataFinal) === "ok")
        .map((prestador: any) => ({
          solicitacao,
          prestador,
          statusChecagem: getChecagemStatus(prestador),
        })),
    )
    .filter((item) => {
      if (!buscaGeral) return true
      const busca = buscaGeral.toLowerCase()
      return (
        item.prestador.nome.toLowerCase().includes(busca) ||
        item.prestador.documento.toLowerCase().includes(busca) ||
        item.solicitacao.numero.toLowerCase().includes(busca)
      )
    })

  const statusCounts = {
    pendente: dadosPorStatus.filter((item) => item.statusChecagem === "pendente").length,
    aprovado: dadosPorStatus.filter((item) => item.statusChecagem === "aprovado").length,
    reprovado: dadosPorStatus.filter((item) => item.statusChecagem === "reprovado").length,
    vencida: dadosPorStatus.filter((item) => item.statusChecagem === "vencida").length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovado":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "reprovado":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "vencida":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aprovado":
        return "text-green-600 bg-green-50"
      case "reprovado":
        return "text-red-600 bg-red-50"
      case "vencida":
        return "text-red-600 bg-red-50"
      default:
        return "text-yellow-600 bg-yellow-50"
    }
  }

  // Calcular paginação
  const totalPrestadores = dadosPorStatus.length
  const totalPaginas = Math.ceil(totalPrestadores / PRESTADORES_POR_PAGINA)
  const indiceInicio = (paginaAtual - 1) * PRESTADORES_POR_PAGINA
  const indiceFim = indiceInicio + PRESTADORES_POR_PAGINA
  const dadosPaginados = dadosPorStatus.slice(indiceInicio, indiceFim)

  const handlePaginaAnterior = () => {
    if (paginaAtual > 1) {
      setPaginaAtual(paginaAtual - 1)
    }
  }

  const handleProximaPagina = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual(paginaAtual + 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-red-800 text-center flex items-center justify-center gap-2">
              <CheckCircle className="h-6 w-6" />
              Status das Checagens - {usuario?.departamento}
            </CardTitle>
            <div className="w-24 h-1 bg-red-600 mx-auto rounded-full"></div>
          </CardHeader>

          <CardContent>
            {/* Resumo por Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-4 text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-700">{statusCounts.pendente}</div>
                  <div className="text-sm text-yellow-600">Pendentes</div>
                </CardContent>
              </Card>

              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700">{statusCounts.aprovado}</div>
                  <div className="text-sm text-green-600">Aprovados</div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">{statusCounts.reprovado}</div>
                  <div className="text-sm text-red-600">Reprovados</div>
                </CardContent>
              </Card>

              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-700">{statusCounts.vencida}</div>
                  <div className="text-sm text-red-600">Vencidas</div>
                </CardContent>
              </Card>
            </div>

            <Alert className="mb-6 border-red-200 bg-red-50">
              <CheckCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                Acompanhe o status das checagens realizadas pelos aprovadores. Total de prestadores:{" "}
                <strong>{dadosPorStatus.length}</strong>
              </AlertDescription>
            </Alert>

            {/* Busca */}
            <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-red-600" />
                <Label className="text-lg font-medium text-red-700">Buscar</Label>
              </div>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Buscar por prestador, documento ou número da solicitação..."
                  value={buscaGeral}
                  onChange={(e) => setBuscaGeral(e.target.value)}
                  className="border-red-300 pr-10"
                />
                <Search className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400" />
              </div>
            </div>

            {/* Informações de Paginação */}
            <div className="mb-4 flex items-center justify-between text-sm text-red-600">
              <div>
                <strong>
                  Mostrando {indiceInicio + 1} - {Math.min(indiceFim, totalPrestadores)} de {totalPrestadores}{" "}
                  prestadores
                </strong>
              </div>
              <div>
                <strong>
                  Página {paginaAtual} de {totalPaginas}
                </strong>
              </div>
            </div>

            {/* Tabela */}
            <div className="rounded-lg border border-red-200 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-red-50">
                    <TableHead className="font-semibold text-red-800 text-center">Solicitação</TableHead>
                    <TableHead className="font-semibold text-red-800 text-center">Prestador</TableHead>
                    <TableHead className="font-semibold text-red-800 text-center">Documento</TableHead>
                    <TableHead className="font-semibold text-red-800 text-center">Status Checagem</TableHead>
                    <TableHead className="font-semibold text-red-800 text-center">Válida até</TableHead>
                    <TableHead className="font-semibold text-red-800 text-center">Observações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dadosPaginados.map(({ solicitacao, prestador, statusChecagem }, index) => (
                    <TableRow key={`${solicitacao.id}-${prestador.id}`} className="hover:bg-red-25">
                      <TableCell className="font-medium text-sm text-center">{solicitacao.numero}</TableCell>
                      <TableCell className="text-sm text-center">{prestador.nome}</TableCell>
                      <TableCell className="text-sm text-center">
                        <div className="text-xs font-mono">{prestador.documento}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(statusChecagem)}`}
                        >
                          {getStatusIcon(statusChecagem)}
                          {statusChecagem.charAt(0).toUpperCase() + statusChecagem.slice(1)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-center">
                        {prestador.checagemValidaAte ? (
                          formatarDataParaBR(prestador.checagemValidaAte)
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-center max-w-[200px]">
                        {prestador.observacoes ? (
                          <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded border whitespace-pre-wrap break-words">
                            {prestador.observacoes}
                          </div>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {dadosPaginados.length === 0 && (
              <div className="text-center py-8 text-red-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-red-300" />
                <p>Nenhuma checagem encontrada.</p>
              </div>
            )}

            <div className="mt-6 text-sm text-red-600 text-center">
              Mostrando <strong>{totalPrestadores}</strong> prestadores em checagem
            </div>

            {/* Controles de Paginação */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-red-600">
                <strong>Total:</strong> {totalPrestadores} prestadores
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handlePaginaAnterior}
                  disabled={paginaAtual === 1}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                <span className="text-sm text-red-600 px-3">
                  {paginaAtual} / {totalPaginas}
                </span>

                <Button
                  onClick={handleProximaPagina}
                  disabled={paginaAtual === totalPaginas}
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-600 disabled:opacity-50"
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
