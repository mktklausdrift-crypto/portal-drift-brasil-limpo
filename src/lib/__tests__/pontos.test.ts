import { adicionarPontos, AcoesPontos } from "@/lib/gamificacao/pontos"
import prisma from "@/lib/prisma"

// Testes básicos para sistema de pontos
describe("Gamificação - Pontos", () => {
  const usuarioId = "test-user-123"

  beforeEach(() => {
    // Reset mocks relevantes
    prisma.pontosUsuario.findFirst.mockResolvedValue(null)
    prisma.pontosUsuario.create.mockResolvedValue({ id: 'p1', usuarioId, pontos: 25, acao: AcoesPontos.PRIMEIRO_LOGIN })
    prisma.pontosUsuario.aggregate.mockResolvedValue({ _sum: { pontos: 25 } })
    prisma.progressoAula.count.mockResolvedValue(0)
    prisma.inscricaoCurso.count.mockResolvedValue(0)
    prisma.tentativaQuiz.count.mockResolvedValue(0)
    prisma.tipoConquista.findMany.mockResolvedValue([])
    prisma.conquistaUsuario.create.mockResolvedValue({})
    prisma.notificacao.create.mockResolvedValue({})
    // Mock user defaults used by auth callbacks optionally
    if (prisma.user && prisma.user.findUnique) {
      prisma.user.findUnique.mockResolvedValue({ id: usuarioId, role: 'STUDENT' })
    }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test("Primeiro login gera pontos e não duplica", async () => {
    const first = await adicionarPontos({ usuarioId, acao: AcoesPontos.PRIMEIRO_LOGIN })
    expect(first).not.toBeNull()
    // Simula já ter recebido (findFirst retorna registro)
    prisma.pontosUsuario.findFirst.mockResolvedValue({ id: 'p1' })
    const second = await adicionarPontos({ usuarioId, acao: AcoesPontos.PRIMEIRO_LOGIN })
    expect(second).toBeNull()
  })

  test("Conclusão de aula soma pontos", async () => {
    prisma.pontosUsuario.create.mockResolvedValueOnce({ id: 'p2', usuarioId, pontos: 10, acao: AcoesPontos.AULA_CONCLUIDA })
    const result = await adicionarPontos({ usuarioId, acao: AcoesPontos.AULA_CONCLUIDA })
    expect(result).not.toBeNull()
    expect(result?.pontos).toBe(10)
    expect(prisma.pontosUsuario.create).toHaveBeenCalled()
  })
})
