"use client"

import { useState } from "react"
import { Eye, Edit, CheckCircle, XCircle, Clock, Filter, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Solicitacao {
  id: string
  numero: string
  dataSolicitacao: string
  local: string
  empresa: string
  dataInicial: string
  dataFinal: string
  status: "pendente" | "aprovado" | "reprovado"
  departamento: string
}

export default function ListaSolicitacoes() {
  const [filtroStatus, setFiltroStatus] = useState<string>("todos")
  const [filtroDataInicial, setFiltroDataInicial] = useState("")
  const [filtroDataFinal, setFiltroDataFinal] = useState("")
  const [perfilUsuario] = useState<"solicitante" | "administrador" | "aprovador">("administrador")

  // Dados simulados
  const solicitacoes: Solicitacao[] = [
    {
      id: "1",
      numero: "SOL-2024-001",
      dataSolicitacao: "15/01/2024",
      local: "Piscina Olímpica",
      empresa: "Limpeza Total Ltda",
      dataInicial: "20/01/2024",
      dataFinal: "25/01/2024",
      status: "aprovado",
      departamento: "Manutenção",
    },
    {
      id: "2",
      numero: "SOL-2024-002",
      dataSolicitacao: "18/01/2024",
      local: "Quadra de Tênis",
      empresa: "Manutenção Express",
      dataInicial: "22/01/2024",
      dataFinal: "24/01/2024",
      status: "pendente",
      departamento: "Tecnologia da Informação",
    },
    {
      id: "3",
      numero: "SOL-2024-003",
      dataSolicitacao: "20/01/2024",
      local: "Salão de Festas",
      empresa: "Decorações Especiais",
      dataInicial: "25/01/2024",
      dataFinal: "26/01/2024",
      status: "reprovado",
      departamento: "Eventos",
    },
    {
      id: "4",
      numero: "SOL-2024-004",
      dataSolicitacao: "22/01/2024",
      local: "Academia",
      empresa: "Equipamentos Fitness",
      dataInicial: "28/01/2024",
      dataFinal: "30/01/2024",
      status: "pendente",
      departamento: "Esportes",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "aprovado":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Aprovado</Badge>
      case "reprovado":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Reprovado</Badge>
      case "pendente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pendente</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "aprovado":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "reprovado":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "pendente":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const solicitacoesFiltradas = solicitacoes.filter((solicitacao) => {
    const statusMatch = filtroStatus === "todos" || solicitacao.status === filtroStatus

    let dataMatch = true
    if (filtroDataInicial && filtroDataFinal) {
      const dataSol = new Date(solicitacao.dataSolicitacao.split("/").reverse().join("-"))
      const dataIni = new Date(filtroDataInicial)
      const dataFim = new Date(filtroDataFinal)
      dataMatch = dataSol >= dataIni && dataSol <= dataFim
    }

    return statusMatch && dataMatch
  })

  const getTituloPagina = () => {
    return perfilUsuario === "solicitante" ? "Minhas Solicitações" : "Solicitações"
  }

  const podeEditar = (solicitacao: Solicitacao) => {
    return perfilUsuario === "administrador"
  }

  const podeAvaliar = (solicitacao: Solicitacao) => {
    return perfilUsuario === "aprovador" && solicitacao.status === "pendente"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-blue-800 text-center">{getTituloPagina()}</CardTitle>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </CardHeader>

          <CardContent>
            {/* Filtros */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-blue-600" />
                <Label className="text-lg font-medium text-gray-700">Filtros</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Status</Label>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="aprovado">Aprovado</SelectItem>
                      <SelectItem value="reprovado">Reprovado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Data Inicial</Label>
                  <Input
                    type="date"
                    value={filtroDataInicial}
                    onChange={(e) => setFiltroDataInicial(e.target.value)}
                    className="border-gray-300"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">Data Final</Label>
                  <Input
                    type="date"
                    value={filtroDataFinal}
                    onChange={(e) => setFiltroDataFinal(e.target.value)}
                    className="border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Tabela */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-50">
                    <TableHead className="font-semibold text-blue-800">Número</TableHead>
                    <TableHead className="font-semibold text-blue-800">Data Solicitação</TableHead>
                    <TableHead className="font-semibold text-blue-800">Departamento</TableHead>
                    <TableHead className="font-semibold text-blue-800">Local</TableHead>
                    <TableHead className="font-semibold text-blue-800">Empresa</TableHead>
                    <TableHead className="font-semibold text-blue-800">Data Inicial</TableHead>
                    <TableHead className="font-semibold text-blue-800">Data Final</TableHead>
                    <TableHead className="font-semibold text-blue-800">Status</TableHead>
                    <TableHead className="font-semibold text-blue-800 text-center">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {solicitacoesFiltradas.map((solicitacao) => (
                    <TableRow key={solicitacao.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{solicitacao.numero}</TableCell>
                      <TableCell>{solicitacao.dataSolicitacao}</TableCell>
                      <TableCell>{solicitacao.departamento}</TableCell>
                      <TableCell>{solicitacao.local}</TableCell>
                      <TableCell>{solicitacao.empresa}</TableCell>
                      <TableCell>{solicitacao.dataInicial}</TableCell>
                      <TableCell>{solicitacao.dataFinal}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(solicitacao.status)}
                          {getStatusBadge(solicitacao.status)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-blue-600 text-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {podeEditar(solicitacao) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-gray-600 text-gray-600 hover:bg-gray-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}

                          {podeAvaliar(solicitacao) && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-600 text-green-600 hover:bg-green-50"
                            >
                              Avaliar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {solicitacoesFiltradas.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhuma solicitação encontrada com os filtros aplicados.</p>
              </div>
            )}

            {/* Resumo */}
            <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
              <span>
                Mostrando {solicitacoesFiltradas.length} de {solicitacoes.length} solicitações
              </span>
              <span>
                Perfil atual: <strong className="text-blue-600">{perfilUsuario}</strong>
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
