import { supabase } from "@/lib/supabase"
import type { Usuario } from "@/types"

export class AuthService {
  // Login com email e senha
  static async login(email: string, senha: string): Promise<{ usuario: Usuario | null; erro: string }> {
    try {
      console.log("🔐 Tentando login para:", email)

      // Buscar usuário no banco
      const { data: usuario, error: userError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", email)
        .single()

      if (userError || !usuario) {
        console.log("❌ Usuário não encontrado:", userError)
        return { usuario: null, erro: "Email não encontrado" }
      }

      // Verificar senha com o banco de dados
      // Nota: Em produção, usaríamos hash (bcrypt/argon2). Por enquanto é texto simples.
      if (senha !== usuario.senha) {
        console.log("❌ Senha incorreta")
        return { usuario: null, erro: "Senha incorreta" }
      }

      console.log("✅ Login realizado com sucesso:", usuario.nome)

      return {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          departamento: usuario.departamento,
          perfil: usuario.perfil as "solicitante" | "aprovador" | "administrador" | "gestor" | "recepcao" | "suporte",
        },
        erro: "",
      }
    } catch (error) {
      console.error("💥 Erro no login:", error)
      return { usuario: null, erro: "Erro interno do servidor" }
    }
  }

  // Alterar senha do usuário logado
  static async alterarSenha(
    userId: string,
    senhaAtual: string,
    novaSenha: string,
  ): Promise<{ sucesso: boolean; erro: string }> {
    try {
      console.log("🔐 Alterando senha para usuário:", userId)

      // Buscar usuário atual
      const { data: usuario, error: userError } = await supabase.from("usuarios").select("*").eq("id", userId).single()

      if (userError || !usuario) {
        return { sucesso: false, erro: "Usuário não encontrado" }
      }

      // Verificar senha atual (por enquanto usando senha padrão "123456")
      if (senhaAtual !== "123456") {
        return { sucesso: false, erro: "Senha atual incorreta" }
      }

      // Atualizar senha no banco (por enquanto salvando como texto)
      // Em produção real, você faria hash da senha
      const { error: updateError } = await supabase.from("usuarios").update({ senha: novaSenha }).eq("id", userId)

      if (updateError) {
        console.error("Erro ao atualizar senha:", updateError)
        return { sucesso: false, erro: "Erro ao atualizar senha" }
      }

      console.log("✅ Senha alterada com sucesso")
      return { sucesso: true, erro: "" }
    } catch (error) {
      console.error("💥 Erro ao alterar senha:", error)
      return { sucesso: false, erro: "Erro interno do servidor" }
    }
  }

  // Buscar usuário por ID
  static async buscarUsuarioPorId(id: string): Promise<Usuario | null> {
    try {
      const { data: usuario, error } = await supabase.from("usuarios").select("*").eq("id", id).single()

      if (error || !usuario) {
        return null
      }

      return {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        departamento: usuario.departamento,
        perfil: usuario.perfil as "solicitante" | "aprovador" | "administrador" | "gestor" | "recepcao" | "suporte",
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      return null
    }
  }

  // Criar usuário (para admin)
  static async criarUsuario(dadosUsuario: {
    nome: string
    email: string
    departamento: string
    perfil: "solicitante" | "aprovador" | "administrador" | "gestor" | "recepcao" | "suporte"
  }): Promise<{ sucesso: boolean; erro: string; usuario?: Usuario }> {
    try {
      const { data: usuario, error } = await supabase.from("usuarios").insert([dadosUsuario]).select().single()

      if (error) {
        console.error("Erro ao criar usuário:", error)
        return { sucesso: false, erro: "Erro ao criar usuário" }
      }

      return {
        sucesso: true,
        erro: "",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          departamento: usuario.departamento,
          perfil: usuario.perfil as "solicitante" | "aprovador" | "administrador" | "gestor" | "recepcao" | "suporte",
        },
      }
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      return { sucesso: false, erro: "Erro interno do servidor" }
    }
  }

  // Listar todos os usuários (para admin)
  static async listarUsuarios(): Promise<Usuario[]> {
    try {
      const { data: usuarios, error } = await supabase.from("usuarios").select("*").order("nome")

      if (error) {
        console.error("Erro ao listar usuários:", error)
        return []
      }

      return usuarios.map((u) => ({
        id: u.id,
        nome: u.nome,
        email: u.email,
        departamento: u.departamento,
        perfil: u.perfil as "solicitante" | "aprovador" | "administrador" | "gestor" | "recepcao" | "suporte",
      }))
    } catch (error) {
      console.error("Erro ao listar usuários:", error)
      return []
    }
  }
}
