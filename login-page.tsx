"use client"

import type React from "react"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LoginPage() {
  const [usuario, setUsuario] = useState("")
  const [senha, setSenha] = useState("")
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [erro, setErro] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setCarregando(true)
    setErro(false)

    // Simular validação de login
    setTimeout(() => {
      if (usuario === "admin" && senha === "123456") {
        // Login bem-sucedido
        console.log("Login realizado com sucesso!")
        setErro(false)
      } else {
        // Credenciais inválidas
        setErro(true)
      }
      setCarregando(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-4 pb-6">
          <div className="text-center">
            <CardTitle className="text-2xl font-bold text-blue-800 mb-2">Acesso Hebraica</CardTitle>
            <div className="w-16 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-sm font-medium text-gray-700">
                Usuário
              </Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Digite seu usuário"
                required
                className="h-11 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  required
                  className="h-11 pr-10 border-gray-300 focus:border-blue-600 focus:ring-blue-600"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-11 w-10 hover:bg-transparent"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="sr-only">{mostrarSenha ? "Ocultar senha" : "Mostrar senha"}</span>
                </Button>
              </div>
            </div>

            {erro && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700 text-sm">Usuário ou senha inválidos</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              disabled={carregando}
            >
              {carregando ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">Para teste: usuário "admin" e senha "123456"</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
