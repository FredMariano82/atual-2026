"use client"

import { LogOut, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "../contexts/auth-context"
import { useState } from "react"
import AlterarSenhaModal from "./alterar-senha-modal"

export default function Header() {
  const { usuario, logout } = useAuth()
  const [showAlterarSenha, setShowAlterarSenha] = useState(false)

  if (!usuario) return null

  return (
    <>
      <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-blue-900 shadow-lg border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <div className="flex items-center space-x-4">
              <img src="/images/mvm-logo-new.png" alt="MVM Solutions" className="h-12 w-auto" />
              <div>
                <h1 className="text-xl font-bold text-white">Sistema de Solicitações</h1>
                <p className="text-sm text-slate-300">Gestão de Prestadores</p>
              </div>
            </div>

            {/* Área do Usuário - Minimalista */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-white">
                <span>{usuario.nome}</span>
                <span className="text-slate-300">•</span>
                <span>{usuario.departamento}</span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAlterarSenha(true)}
                className="text-white hover:bg-white/10"
              >
                <Settings className="h-4 w-4 mr-2" />
                Alterar Senha
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-white text-white bg-white/20 hover:bg-white/30 hover:border-white shadow-md"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Modal de Alterar Senha */}
      <AlterarSenhaModal isOpen={showAlterarSenha} onClose={() => setShowAlterarSenha(false)} />
    </>
  )
}
