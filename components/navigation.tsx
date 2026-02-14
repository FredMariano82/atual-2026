"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "../contexts/auth-context"
import { CheckCircle, FileText, Users, BarChart3, HeadphonesIcon, Crown } from "lucide-react"
import { getSolicitacoesByDepartamento } from "../services/solicitacoes-service"
import { getCadastroStatus } from "./ui/status-badges"
import { converterDataBrParaDate, getCurrentDate } from "../utils/date-helpers"

export default function Navigation() {
  const { usuario } = useAuth()
  const pathname = usePathname()
  const [alertaLiberacoes, setAlertaLiberacoes] = useState(false)

  // Função para verificar prestadores com data final próxima do vencimento
  const verificarLiberacoesUrgentes = async () => {
    if (!usuario?.departamento) return

    try {
      const solicitacoes = await getSolicitacoesByDepartamento(usuario.departamento)

      // Filtrar prestadores com liberação "Ok"
      const prestadoresLiberados = solicitacoes
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
              dataFinal: solicitacao.dataFinal,
            })),
        )

      // Verificar se algum tem data final próxima (hoje ou amanhã)
      const hoje = getCurrentDate()
      hoje.setHours(0, 0, 0, 0)

      const temUrgentes = prestadoresLiberados.some(({ dataFinal }) => {
        if (!dataFinal) return false

        const dataFinalDate = converterDataBrParaDate(dataFinal)
        if (!dataFinalDate) return false

        dataFinalDate.setHours(0, 0, 0, 0)

        const diffTime = dataFinalDate.getTime() - hoje.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Considerar urgente se vence hoje (0 dias) ou amanhã (1 dia)
        return diffDays <= 1 && diffDays >= 0
      })

      setAlertaLiberacoes(temUrgentes)
    } catch (error) {
      console.error("Erro ao verificar liberações urgentes:", error)
    }
  }

  // Verificar liberações urgentes quando o componente montar e a cada 30 segundos
  useEffect(() => {
    if (usuario?.perfil === "solicitante") {
      verificarLiberacoesUrgentes()
      const interval = setInterval(verificarLiberacoesUrgentes, 30000)
      return () => clearInterval(interval)
    }
  }, [usuario])

  const getButtonClass = (path: string) => {
    const baseClass = "px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
    const isActive = pathname === path || pathname?.startsWith(path + "/")

    if (isActive) {
      return `${baseClass} bg-slate-700 text-white hover:bg-slate-800 shadow-lg`
    }
    return `${baseClass} bg-white text-slate-700 hover:bg-slate-100 border border-slate-300 shadow-sm`
  }

  const getLiberacoesButtonClass = (path: string) => {
    const baseClass = getButtonClass(path)
    const isActive = pathname === path

    if (alertaLiberacoes && !isActive) {
      return `${baseClass} animate-pulse-red shadow-lg`
    }

    return baseClass
  }

  if (!usuario) return null

  // Mapeamento de Rotas por Perfil
  const getMenuButtons = () => {
    switch (usuario.perfil) {
      case "solicitante":
        return [
          {
            href: "/solicitante/nova-solicitacao",
            label: "Nova Solicitação",
            icon: FileText,
            className: getButtonClass("/solicitante/nova-solicitacao"),
          },

          {
            href: "/solicitante/checagens",
            label: "Checagens",
            icon: CheckCircle,
            className: getButtonClass("/solicitante/checagens"),
          },
          {
            href: "/solicitante/liberacoes",
            label: "Liberações",
            icon: CheckCircle,
            className: getLiberacoesButtonClass("/solicitante/liberacoes"),
            hasAlert: alertaLiberacoes,
          },
          {
            href: "/solicitante/departamento",
            label: "Solicitações do Departamento",
            icon: Users,
            className: getButtonClass("/solicitante/departamento"),
          },
        ]

      case "aprovador":
        return [
          {
            href: "/aprovador/pendentes",
            label: "Solicitações Pendentes",
            icon: CheckCircle,
            className: getButtonClass("/aprovador/pendentes"),
          },
        ]

      case "administrador":
        return [
          {
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: BarChart3,
            className: getButtonClass("/admin/dashboard"),
          },
          {
            href: "/admin/todas-solicitacoes",
            label: "Todas as Solicitações",
            icon: FileText,
            className: getButtonClass("/admin/todas-solicitacoes"),
          },
          {
            href: "/admin/nova-solicitacao",
            label: "Nova Solicitação",
            icon: FileText,
            className: getButtonClass("/admin/nova-solicitacao"),
          },
          {
            href: "/admin/upload",
            label: "Upload Histórico",
            icon: Users,
            className: getButtonClass("/admin/upload"),
          },
          {
            href: "/admin/produtividade",
            label: "Produtividade",
            icon: BarChart3,
            className: getButtonClass("/admin/produtividade"),
          },
        ]

      case "gestor":
        return [
          {
            href: "/gestor/consulta",
            label: "Consulta Solicitações",
            icon: BarChart3,
            className: getButtonClass("/gestor/consulta"),
          },
        ]

      case "recepcao":
        return [
          {
            href: "/recepcao/todas",
            label: "Todas as Solicitações",
            icon: FileText,
            className: getButtonClass("/recepcao/todas"),
          },
        ]

      case "suporte":
        return [
          {
            href: "/suporte/migracao",
            label: "Migração de Dados",
            icon: Users,
            className: getButtonClass("/suporte/migracao"),
          },
          {
            href: "/suporte/consulta",
            label: "Consultar Solicitações",
            icon: HeadphonesIcon,
            className: getButtonClass("/suporte/consulta"),
          },
        ]

      case "superadmin":
        return [
          {
            href: "/superadmin/painel",
            label: "Painel de Controle",
            icon: Crown,
            className: getButtonClass("/superadmin/painel"),
          },
          {
            href: "/admin/dashboard", // Reutiliza rota de admin
            label: "Dashboard",
            icon: BarChart3,
            className: getButtonClass("/admin/dashboard"),
          },
          {
            href: "/admin/todas-solicitacoes",
            label: "Todas as Solicitações",
            icon: FileText,
            className: getButtonClass("/admin/todas-solicitacoes"),
          },
          {
            href: "/admin/nova-solicitacao",
            label: "Nova Solicitação",
            icon: FileText,
            className: getButtonClass("/admin/nova-solicitacao"),
          },
          {
            href: "/admin/upload",
            label: "Upload Histórico",
            icon: Users,
            className: getButtonClass("/admin/upload"),
          },
        ]

      default:
        return []
    }
  }

  const menuButtons = getMenuButtons()

  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <style jsx>{`
        @keyframes pulse-red {
          0%, 100% {
            background-color: white;
            color: #dc2626;
            border-color: #dc2626;
          }
          50% {
            background-color: #dc2626;
            color: white;
            border-color: #dc2626;
          }
        }
        
        .animate-pulse-red {
          animation: pulse-red 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3 justify-center">
          {menuButtons.map((button) => {
            const IconComponent = button.icon
            return (
              <Link key={button.href} href={button.href}>
                <Button
                  className={button.className}
                  variant="ghost"
                  asChild // Importante para acessibilidade com Link
                >
                  <span className="flex items-center gap-2">
                    <IconComponent className="h-5 w-5" />
                    {button.label}
                    {button.hasAlert && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>}
                  </span>
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
