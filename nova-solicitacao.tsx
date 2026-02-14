"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Trash2, AlertTriangle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface Prestador {
  id: string
  nome: string
  documento: string
}

export default function NovaSolicitacao() {
  const [local, setLocal] = useState("")
  const [empresa, setEmpresa] = useState("")
  const [prestadores, setPrestadores] = useState<Prestador[]>([{ id: "1", nome: "", documento: "" }])
  const [dataInicial, setDataInicial] = useState("")
  const [dataFinal, setDataFinal] = useState("")
  const [erro, setErro] = useState("")
  const [sucesso, setSucesso] = useState("")
  const [alertaValidacao, setAlertaValidacao] = useState("")
  const [carregando, setCarregando] = useState(false)

  // Dados preenchidos automaticamente
  const dadosAutomaticos = {
    solicitante: "João Silva",
    departamento: "Tecnologia da Informação",
    dataHoraSolicitacao: new Date().toLocaleString("pt-BR"),
  }

  const adicionarPrestador = () => {
    const novoId = (prestadores.length + 1).toString()
    setPrestadores([...prestadores, { id: novoId, nome: "", documento: "" }])
  }

  const removerPrestador = (id: string) => {
    if (prestadores.length > 1) {
      setPrestadores(prestadores.filter((p) => p.id !== id))
    }
  }

  const atualizarPrestador = (id: string, campo: "nome" | "documento", valor: string) => {
    setPrestadores(prestadores.map((p) => (p.id === id ? { ...p, [campo]: valor } : p)))
  }

  const validarChecagem = () => {
    // Simular validação de checagem nos últimos 6 meses
    const dataLimite = new Date()
    dataLimite.setMonth(dataLimite.getMonth() + 6)

    const dataInicialObj = new Date(dataInicial)

    if (dataInicialObj > dataLimite) {
      setAlertaValidacao(
        `Data limite para acesso: ${dataLimite.toLocaleDateString("pt-BR")}. Não é possível solicitar acesso além desta data.`,
      )
      return false
    }

    // Simular checagem existente
    const checagemExistente = new Date("2024-08-15")
    if (dataInicialObj < checagemExistente) {
      setAlertaValidacao(
        `Existe uma checagem válida até ${checagemExistente.toLocaleDateString("pt-BR")}. Deseja manter a menor data ou preservar a maior?`,
      )
      return false
    }

    return true
  }

  const validarFormulario = () => {
    if (!local.trim()) return "Local específico é obrigatório"
    if (!empresa.trim()) return "Empresa prestadora é obrigatória"
    if (!dataInicial) return "Data inicial é obrigatória"
    if (!dataFinal) return "Data final é obrigatória"

    for (const prestador of prestadores) {
      if (!prestador.nome.trim() || !prestador.documento.trim()) {
        return "Todos os prestadores devem ter nome e documento preenchidos"
      }
    }

    if (new Date(dataFinal) < new Date(dataInicial)) {
      return "Data final deve ser posterior à data inicial"
    }

    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErro("")
    setSucesso("")
    setAlertaValidacao("")

    const erroValidacao = validarFormulario()
    if (erroValidacao) {
      setErro(erroValidacao)
      return
    }

    if (!validarChecagem()) {
      return
    }

    setCarregando(true)

    // Simular envio
    setTimeout(() => {
      setSucesso("Solicitação enviada com sucesso!")
      setCarregando(false)

      // Limpar formulário após sucesso
      setTimeout(() => {
        setLocal("")
        setEmpresa("")
        setPrestadores([{ id: "1", nome: "", documento: "" }])
        setDataInicial("")
        setDataFinal("")
        setSucesso("")
      }, 3000)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-6">
            <CardTitle className="text-2xl font-bold text-blue-800 text-center">Nova Solicitação de Acesso</CardTitle>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados Automáticos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nome do Solicitante</Label>
                  <Input value={dadosAutomaticos.solicitante} disabled className="bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Departamento</Label>
                  <Input value={dadosAutomaticos.departamento} disabled className="bg-gray-50 text-gray-600" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Data e Hora da Solicitação</Label>
                  <Input value={dadosAutomaticos.dataHoraSolicitacao} disabled className="bg-gray-50 text-gray-600" />
                </div>
              </div>

              <Separator />

              {/* Campos de Entrada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="local" className="text-sm font-medium text-gray-700">
                    Local específico no clube *
                  </Label>
                  <Input
                    id="local"
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex: Piscina, Quadra de Tênis, Salão de Festas"
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <Label htmlFor="empresa" className="text-sm font-medium text-gray-700">
                    Empresa Prestadora *
                  </Label>
                  <Input
                    id="empresa"
                    value={empresa}
                    onChange={(e) => setEmpresa(e.target.value)}
                    placeholder="Nome da empresa prestadora de serviços"
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </div>

              <Separator />

              {/* Seção de Prestadores */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg font-medium text-gray-700">Prestadores</Label>
                  <Button
                    type="button"
                    onClick={adicionarPrestador}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Prestador
                  </Button>
                </div>

                <div className="space-y-3">
                  {prestadores.map((prestador, index) => (
                    <div key={prestador.id} className="flex gap-3 items-end">
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700">Nome do Prestador {index + 1} *</Label>
                        <Input
                          value={prestador.nome}
                          onChange={(e) => atualizarPrestador(prestador.id, "nome", e.target.value)}
                          placeholder="Nome completo"
                          className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                        />
                      </div>
                      <div className="flex-1">
                        <Label className="text-sm font-medium text-gray-700">
                          Documento do Prestador {index + 1} *
                        </Label>
                        <Input
                          value={prestador.documento}
                          onChange={(e) => atualizarPrestador(prestador.id, "documento", e.target.value)}
                          placeholder="CPF ou RG"
                          className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                        />
                      </div>
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
                  ))}
                </div>
              </div>

              <Separator />

              {/* Datas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dataInicial" className="text-sm font-medium text-gray-700">
                    Data Inicial do Acesso *
                  </Label>
                  <Input
                    id="dataInicial"
                    type="date"
                    value={dataInicial}
                    onChange={(e) => setDataInicial(e.target.value)}
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <Label htmlFor="dataFinal" className="text-sm font-medium text-gray-700">
                    Data Final do Acesso *
                  </Label>
                  <Input
                    id="dataFinal"
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    className="border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Alertas e Mensagens */}
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

              {/* Botão de Envio */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
                  disabled={carregando}
                >
                  {carregando ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
