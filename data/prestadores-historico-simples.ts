// VERSÃO ULTRA SIMPLES - SEM NORMALIZAÇÕES COMPLEXAS

export const prestadores = [
  { documento: "11122233344", nome: "Ana Costa", validade: "20/05/2024", status: "valido" },
  { documento: "44455566677", nome: "Ana Costa", validade: "10/02/2024", status: "vencido" },
  { documento: "99988877766", nome: "Ana Costa", validade: "01/07/2024", status: "valido" },
  { documento: "12345678900", nome: "Pedro Oliveira", validade: "15/06/2024", status: "valido" },
]

export function buscarPorDocumento(doc: string) {
  // Remove tudo que não é número
  const docLimpo = doc.replace(/\D/g, "")

  console.log("BUSCA:", docLimpo)
  console.log(
    "BASE:",
    prestadores.map((p) => p.documento),
  )

  const encontrado = prestadores.find((p) => p.documento === docLimpo)

  console.log("RESULTADO:", encontrado || "NÃO ENCONTRADO")

  return encontrado || null
}
