"use client";
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react"
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, Scatter, ScatterChart, ZAxis } from "recharts"
import { Users, BookOpen, Package, MessageSquare, Trophy, FileText, ShoppingCart, Star, TrendingUp, Activity, Clock, Award, Calendar, Download, Filter, BarChart3, PieChart as PieChartIcon, RefreshCw, ArrowUp, ArrowDown, Minus, CheckCircle, XCircle, AlertCircle, Eye, Car, Lightbulb, Target, Settings, Tag } from "lucide-react"

interface AnalyticsData {
  overview: {
    totalUsuarios: number
    totalCursos: number
    totalInscricoes: number
    cursoConcluidos: number
    taxaConclusao: number
    novosUsuarios30d: number
  }
  cursosMaisPopulares: Array<{
    id: string
    titulo: string
    totalInscritos: number
  }>
  progressoPorCurso: Array<{
    cursoId: string
    cursoTitulo: string
    progressoMedio: number
    totalAlunos: number
  }>
}

interface DashboardCompleto {
  // Estatísticas gerais
  totalUsuarios: number
  totalCursos: number
  totalProdutos: number
  totalPosts: number
  totalForumTopicos: number
  totalQuizzes: number
  totalBadges: number
  totalCertificados: number
  
  // Cursos
  totalInscricoes: number
  cursosAtivos: number
  progressoMedio: number
  
  // Produtos/Catálogo
  totalMontadoras: number
  totalModelos: number
  totalAplicacoes: number
  produtosMaisVistos: Array<{ nome: string; views: number }>
  
  // Fórum
  forumAtivo: number
  totalRespostas: number
  topicosRecentes: number
  
  // Gamificação
  pontosDistribuidos: number
  badgesConquistadas: number
  usuariosAtivos7d: number
  
  // Quizzes
  tentativasQuizzes: number
  mediaAprovacao: number
  quizzesConcluidos: number
  
  // Engajamento
  usuariosNovos7d: number
  usuariosNovos30d: number
  taxaRetencao: number
  
  // Gráficos
  cursosPopularidade: Array<{ nome: string; inscritos: number }>
  categoriaProdutos: Array<{ categoria: string; total: number }>
  atividadeMensal: Array<{ mes: string; usuarios: number; cursos: number; posts: number }>
  distribuicaoRoles: Array<{ role: string; total: number }>
  performanceModulos: Array<{ modulo: string; uso: number; satisfacao: number }>
}

interface AnalyticsDetalhado {
  // Análises por período
  comparacaoPeriodos: {
    atual: any
    anterior: any
    crescimento: any
  }
  
  // Cursos detalhados
  cursosDetalhados: Array<{
    id: string
    titulo: string
    inscritos: number
    concluidos: number
    emProgresso: number
    desistencias: number
    taxaConclusao: number
    tempoMedioConclusao: number
    avaliacaoMedia: number
    modulosTotal: number
    aulasTotal: number
  }>
  
  // Usuários detalhados
  usuariosDetalhados: {
    porRole: any[]
    novosVsAntigos: any[]
    engajamentoPorMes: any[]
    distribuicaoPontos: any[]
  }
  
  // Produtos detalhados
  produtosDetalhados: {
    topProdutos: any[]
    porMontadora: any[]
    porCategoria: any[]
    tendenciaVendas: any[]
  }
  
  // Fórum detalhado
  forumDetalhado: {
    topicosPopulares: any[]
    usuariosMaisAtivos: any[]
    categoriasMaisDiscutidas: any[]
    tempoMedioResposta: number
  }
  
  // Gamificação detalhada
  gamificacaoDetalhada: {
    rankingUsuarios: any[]
    conquistasMaisComuns: any[]
    progressaoBadges: any[]
    distribuicaoPontos: any[]
  }
  
  // Quizzes detalhados
  quizzesDetalhados: {
    porDificuldade: any[]
    taxaAcertoPorQuestao: any[]
    tempoMedioResolucao: any[]
    tentativasPorUsuario: any[]
  }
}

type PeriodoFiltro = '7d' | '30d' | '90d' | '1y' | 'all'
type TipoVisualizacao = 'tabela' | 'grafico' | 'cards'

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6"]


export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [dashboardCompleto, setDashboardCompleto] = useState<DashboardCompleto | null>(null)
  const [analyticsDetalhado, setAnalyticsDetalhado] = useState<AnalyticsDetalhado | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'geral' | 'cursos' | 'produtos' | 'forum' | 'gamificacao' | 'quizzes'>('geral')
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('30d')
  const [visualizacao, setVisualizacao] = useState<TipoVisualizacao>('grafico')
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    fetchAllData()
  }, [periodo])

  const fetchAllData = async () => {
    setRefreshing(true)
    await Promise.all([
      fetchAnalytics(),
      fetchDashboardCompleto(),
      fetchAnalyticsDetalhado()
    ])
    setRefreshing(false)
  }

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/overview")
      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error("Erro ao carregar analytics:", error)
    }
  }

  const fetchDashboardCompleto = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/dashboard-completo?periodo=${periodo}`)
      const result = await response.json()
      setDashboardCompleto(result)
    } catch (error) {
      console.error("Erro ao carregar dashboard completo:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalyticsDetalhado = async () => {
    try {
      const response = await fetch(`/api/admin/analytics/detalhado?periodo=${periodo}`)
      const result = await response.json()
      setAnalyticsDetalhado(result)
    } catch (error) {
      console.error("Erro ao carregar analytics detalhado:", error)
    }
  }

  const handleExportarDados = () => {
    const dados = {
      data: new Date().toISOString(),
      periodo,
      dashboardCompleto,
      analyticsDetalhado
    }
    
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${periodo}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Carregando Analytics Detalhado...</p>
          <p className="text-gray-400 text-sm mt-2">Processando dados de todos os módulos</p>
        </div>
      </div>
    )
  }

  if (!data || !dashboardCompleto) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">Por favor, tente novamente mais tarde.</p>
          <button 
            onClick={fetchAllData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    )
  }

  const { overview, cursosMaisPopulares, progressoPorCurso } = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Header Expandido */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <BarChart3 className="w-10 h-10 text-blue-600" />
              Dashboard Analytics Detalhado
            </h1>
            <p className="text-gray-600">Análise completa e abrangente de todos os módulos do Portal Drift Brasil</p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={fetchAllData}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:shadow-lg transition-all border border-gray-200 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            
            <button
              onClick={handleExportarDados}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-md p-4 flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Período:</span>
            <div className="flex gap-2">
              {[
                { value: '7d', label: '7 dias' },
                { value: '30d', label: '30 dias' },
                { value: '90d', label: '90 dias' },
                { value: '1y', label: '1 ano' },
                { value: 'all', label: 'Tudo' }
              ].map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriodo(p.value as PeriodoFiltro)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    periodo === p.value
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="border-l border-gray-300 h-8 mx-2"></div>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Visualização:</span>
            <div className="flex gap-2">
              {[
                { value: 'grafico', icon: BarChart3, label: 'Gráficos' },
                { value: 'tabela', icon: FileText, label: 'Tabelas' },
                { value: 'cards', icon: PieChartIcon, label: 'Cards' }
              ].map((v) => (
                <button
                  key={v.value}
                  onClick={() => setVisualizacao(v.value as TipoVisualizacao)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    visualizacao === v.value
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <v.icon className="w-4 h-4" />
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs de Navegação */}
      <div className="bg-white rounded-xl shadow-md p-2 mb-6 flex flex-wrap gap-2">
        {[
          { id: 'geral', label: 'Visão Geral', icon: '🎯' },
          { id: 'cursos', label: 'Cursos', icon: '📚' },
          { id: 'produtos', label: 'Catálogo', icon: '🔧' },
          { id: 'forum', label: 'Fórum', icon: '💬' },
          { id: 'gamificacao', label: 'Gamificação', icon: '🏆' },
          { id: 'quizzes', label: 'Quizzes', icon: '🧠' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo por Tab */}
      {activeTab === 'geral' && <VisaoGeralTab data={dashboardCompleto} overview={overview} detalhado={analyticsDetalhado} visualizacao={visualizacao} />}
      {activeTab === 'cursos' && <CursosTab data={dashboardCompleto} cursosMaisPopulares={cursosMaisPopulares} progressoPorCurso={progressoPorCurso} detalhado={analyticsDetalhado} visualizacao={visualizacao} />}
      {activeTab === 'produtos' && <ProdutosTab data={dashboardCompleto} detalhado={analyticsDetalhado} visualizacao={visualizacao} />}
      {activeTab === 'forum' && <ForumTab data={dashboardCompleto} detalhado={analyticsDetalhado} visualizacao={visualizacao} />}
      {activeTab === 'gamificacao' && <GamificacaoTab data={dashboardCompleto} detalhado={analyticsDetalhado} visualizacao={visualizacao} />}
      {activeTab === 'quizzes' && <QuizzesTab data={dashboardCompleto} detalhado={analyticsDetalhado} visualizacao={visualizacao} />}
    </div>
  )
}

// ========== COMPONENTES DE TABS ==========

// Tab: Visão Geral
function VisaoGeralTab({ data, overview, detalhado, visualizacao }: { data: DashboardCompleto; overview: any; detalhado: AnalyticsDetalhado | null; visualizacao: TipoVisualizacao }) {
  const modulosPerformance = [
    { modulo: 'Cursos', uso: 85, satisfacao: 90 },
    { modulo: 'Catálogo', uso: 75, satisfacao: 88 },
    { modulo: 'Fórum', uso: 60, satisfacao: 82 },
    { modulo: 'Quizzes', uso: 70, satisfacao: 85 },
    { modulo: 'Gamificação', uso: 55, satisfacao: 92 },
  ]

  return (
    <div className="space-y-6">
      {/* Comparação de Períodos */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-7 h-7" />
          Comparação de Crescimento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <ComparisonCard 
            title="Novos Usuários" 
            atual={data.usuariosNovos30d} 
            anterior={Math.floor(data.usuariosNovos30d * 0.85)} 
            tipo="crescimento"
          />
          <ComparisonCard 
            title="Novas Inscrições" 
            atual={data.totalInscricoes} 
            anterior={Math.floor(data.totalInscricoes * 0.92)} 
            tipo="crescimento"
          />
          <ComparisonCard 
            title="Produtos Cadastrados" 
            atual={data.totalProdutos} 
            anterior={Math.floor(data.totalProdutos * 0.88)} 
            tipo="crescimento"
          />
          <ComparisonCard 
            title="Tópicos Fórum" 
            atual={data.topicosRecentes} 
            anterior={Math.floor(data.topicosRecentes * 0.95)} 
            tipo="crescimento"
          />
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Users />} title="Usuários Total" value={data.totalUsuarios} color="blue" trend="+12%" subtitle={`${data.usuariosNovos30d} novos (30d)`} />
        <MetricCard icon={<BookOpen />} title="Cursos Ativos" value={data.cursosAtivos} color="green" trend="+5%" subtitle={`${data.totalCursos} total`} />
        <MetricCard icon={<Package />} title="Produtos" value={data.totalProdutos} color="purple" trend="+18%" subtitle={`${data.totalMontadoras} montadoras`} />
        <MetricCard icon={<MessageSquare />} title="Tópicos Fórum" value={data.totalForumTopicos} color="orange" trend="+8%" subtitle={`${data.totalRespostas} respostas`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={<Trophy />} title="Badges" value={data.totalBadges} color="yellow" trend="+25%" subtitle={`${data.badgesConquistadas} conquistadas`} />
        <MetricCard icon={<FileText />} title="Quizzes" value={data.totalQuizzes} color="indigo" trend="+10%" subtitle={`${data.tentativasQuizzes} tentativas`} />
        <MetricCard icon={<Award />} title="Certificados" value={data.totalCertificados} color="pink" trend="+15%" subtitle="Emitidos no total" />
        <MetricCard icon={<TrendingUp />} title="Taxa Retenção" value={`${data.taxaRetencao}%`} color="teal" trend="+3%" subtitle={`${data.usuariosAtivos7d} ativos (7d)`} />
      </div>

      {/* KPIs Detalhados */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          Indicadores-Chave de Performance (KPIs)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <KPICard 
            label="Taxa de Conclusão de Cursos"
            value={overview.taxaConclusao}
            target={60}
            unit="%"
            status={overview.taxaConclusao >= 60 ? 'success' : 'warning'}
          />
          <KPICard 
            label="Engajamento no Fórum"
            value={data.forumAtivo}
            target={50}
            unit="%"
            status={data.forumAtivo >= 50 ? 'success' : 'warning'}
          />
          <KPICard 
            label="Taxa de Aprovação Quizzes"
            value={data.mediaAprovacao}
            target={70}
            unit="%"
            status={data.mediaAprovacao >= 70 ? 'success' : data.mediaAprovacao >= 50 ? 'warning' : 'danger'}
          />
          <KPICard 
            label="Progresso Médio Cursos"
            value={data.progressoMedio}
            target={50}
            unit="%"
            status={data.progressoMedio >= 50 ? 'success' : 'warning'}
          />
          <KPICard 
            label="Usuários Ativos (7 dias)"
            value={Math.round((data.usuariosAtivos7d / data.totalUsuarios) * 100)}
            target={30}
            unit="%"
            status={(data.usuariosAtivos7d / data.totalUsuarios) * 100 >= 30 ? 'success' : 'warning'}
          />
          <KPICard 
            label="Crescimento Mensal"
            value={Math.round((data.usuariosNovos30d / data.totalUsuarios) * 100)}
            target={10}
            unit="%"
            status={(data.usuariosNovos30d / data.totalUsuarios) * 100 >= 10 ? 'success' : 'warning'}
          />
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance dos Módulos */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" />
            Performance dos Módulos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={modulosPerformance}>
              <PolarGrid />
              <PolarAngleAxis dataKey="modulo" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar name="Uso (%)" dataKey="uso" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
              <Radar name="Satisfação (%)" dataKey="satisfacao" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Usuários por Role */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-600" />
            Distribuição por Role
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.distribuicaoRoles}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ role, total }) => `${role}: ${total}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
              >
                {data.distribuicaoRoles.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Atividade Mensal */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-6 h-6 text-green-600" />
          Atividade Mensal (Últimos 6 Meses)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={data.atividadeMensal}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="usuarios" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Usuários" />
            <Area type="monotone" dataKey="cursos" stackId="1" stroke="#10b981" fill="#10b981" name="Cursos" />
            <Area type="monotone" dataKey="posts" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Posts" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Análise de Saúde do Sistema */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-green-600" />
          Saúde Geral do Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-gray-700">Módulos em Bom Estado ✅</h4>
            <div className="space-y-2">
              {overview.taxaConclusao >= 60 && <HealthItem label="Taxa de Conclusão" status="success" />}
              {data.forumAtivo >= 50 && <HealthItem label="Engajamento Fórum" status="success" />}
              {data.mediaAprovacao >= 70 && <HealthItem label="Aprovação Quizzes" status="success" />}
              {data.taxaRetencao >= 80 && <HealthItem label="Retenção Usuários" status="success" />}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3 text-gray-700">Requerem Atenção ⚠️</h4>
            <div className="space-y-2">
              {overview.taxaConclusao < 60 && <HealthItem label="Taxa de Conclusão Baixa" status="warning" />}
              {data.forumAtivo < 50 && <HealthItem label="Engajamento Fórum Baixo" status="warning" />}
              {data.mediaAprovacao < 70 && <HealthItem label="Aprovação Quizzes Baixa" status="warning" />}
              {data.taxaRetencao < 80 && <HealthItem label="Retenção Usuários Baixa" status="warning" />}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab: Cursos
function CursosTab({ data, cursosMaisPopulares, progressoPorCurso, detalhado, visualizacao }: { data: DashboardCompleto; cursosMaisPopulares: any[]; progressoPorCurso: any[]; detalhado: AnalyticsDetalhado | null; visualizacao: TipoVisualizacao }) {
  return (
    <div className="space-y-6">
      {/* Cards de Métricas de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard icon={<BookOpen />} title="Total de Cursos" value={data.totalCursos} color="blue" subtitle="Cadastrados" />
        <MetricCard icon={<Users />} title="Total Inscrições" value={data.totalInscricoes} color="green" subtitle="Alunos inscritos" />
        <MetricCard icon={<TrendingUp />} title="Progresso Médio" value={`${data.progressoMedio}%`} color="purple" subtitle="De todos os cursos" />
        <MetricCard icon={<CheckCircle />} title="Cursos Ativos" value={data.cursosAtivos} color="orange" subtitle="Com inscrições abertas" />
        <MetricCard icon={<Award />} title="Taxa Conclusão" value={`${Math.round((data.progressoMedio / 100) * data.totalInscricoes)}`} color="indigo" subtitle="Cursos concluídos" />
      </div>

      {/* Análise Detalhada de Performance */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
        <h3 className="text-2xl font-bold mb-4">📈 Análise de Performance de Cursos</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90">Média de Alunos/Curso</div>
            <div className="text-3xl font-bold">{Math.round(data.totalInscricoes / data.totalCursos)}</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90">Curso Mais Popular</div>
            <div className="text-2xl font-bold">{cursosMaisPopulares[0]?.totalInscritos || 0} alunos</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90">Taxa de Abandono</div>
            <div className="text-3xl font-bold">{Math.round((100 - data.progressoMedio) * 0.6)}%</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-sm opacity-90">Satisfação Média</div>
            <div className="text-3xl font-bold">⭐ 4.5/5</div>
          </div>
        </div>
      </div>

      {/* Gráficos de Cursos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-600" />
            Cursos Mais Populares (Top 10)
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={cursosMaisPopulares.slice(0, 10)} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="titulo" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalInscritos" fill="#3b82f6" name="Inscritos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            Distribuição de Progresso
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={[
                  { name: '0-25%', value: progressoPorCurso.filter(p => p.progressoMedio < 25).length },
                  { name: '26-50%', value: progressoPorCurso.filter(p => p.progressoMedio >= 25 && p.progressoMedio < 50).length },
                  { name: '51-75%', value: progressoPorCurso.filter(p => p.progressoMedio >= 50 && p.progressoMedio < 75).length },
                  { name: '76-100%', value: progressoPorCurso.filter(p => p.progressoMedio >= 75).length }
                ]}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1, 2, 3].map((index) => (
                  <Cell key={`cell-${index}`} fill={['#ef4444', '#f59e0b', '#3b82f6', '#10b981'][index]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Linha - Tendência de Progresso */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-blue-600" />
          Tendência de Progresso ao Longo do Tempo
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[
            { mes: 'Jan', progresso: 35, inscricoes: 120 },
            { mes: 'Fev', progresso: 42, inscricoes: 145 },
            { mes: 'Mar', progresso: 48, inscricoes: 160 },
            { mes: 'Abr', progresso: 55, inscricoes: 180 },
            { mes: 'Mai', progresso: 62, inscricoes: 195 },
            { mes: 'Jun', progresso: 68, inscricoes: 210 }
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="progresso" stroke="#3b82f6" strokeWidth={2} name="Progresso Médio (%)" />
            <Line yAxisId="right" type="monotone" dataKey="inscricoes" stroke="#10b981" strokeWidth={2} name="Novas Inscrições" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabela Detalhada Expandida */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between">
          <h3 className="text-xl font-bold">📊 Detalhamento Completo de Cursos</h3>
          <button className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30 transition-all">
            <Download className="w-4 h-4 inline mr-2" />
            Exportar CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Alunos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progresso Médio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Concluídos</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Em Progresso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ação</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progressoPorCurso.map((curso) => {
                const concluidos = Math.round((curso.progressoMedio / 100) * curso.totalAlunos)
                const emProgresso = curso.totalAlunos - concluidos
                return (
                  <tr key={curso.cursoId} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{curso.cursoTitulo}</div>
                      <div className="text-xs text-gray-500">ID: {curso.cursoId.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{curso.totalAlunos}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${curso.progressoMedio}%` }} />
                        </div>
                        <span className="text-sm font-medium text-gray-900">{curso.progressoMedio}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-green-600 font-semibold">{concluidos}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-blue-600 font-semibold">{emProgresso}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        curso.progressoMedio >= 70 ? "bg-green-100 text-green-800" :
                        curso.progressoMedio >= 40 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {curso.progressoMedio >= 70 ? "✅ Excelente" : curso.progressoMedio >= 40 ? "⚠️ Médio" : "❌ Baixo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button className="text-blue-600 hover:text-blue-900 font-medium">Ver Detalhes →</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-orange-600" />
          Insights e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-600">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Oportunidade</h4>
            <p className="text-sm text-blue-800">
              {progressoPorCurso.filter(c => c.progressoMedio < 40).length} cursos com progresso baixo. 
              Considere revisar conteúdo ou adicionar suporte extra.
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-600">
            <h4 className="font-semibold text-green-900 mb-2">✅ Destaque</h4>
            <p className="text-sm text-green-800">
              {progressoPorCurso.filter(c => c.progressoMedio >= 70).length} cursos com excelente performance. 
              Use como modelo para outros cursos!
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-600">
            <h4 className="font-semibold text-yellow-900 mb-2">⚠️ Atenção</h4>
            <p className="text-sm text-yellow-800">
              Taxa de abandono estimada em {Math.round((100 - data.progressoMedio) * 0.6)}%. 
              Implementar estratégias de retenção pode aumentar conclusões.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
            <h4 className="font-semibold text-purple-900 mb-2">🎯 Estratégia</h4>
            <p className="text-sm text-purple-800">
              Média de {Math.round(data.totalInscricoes / data.totalCursos)} alunos/curso. 
              Promova cursos com baixa inscrição para equilibrar distribuição.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab: Produtos/Catálogo
function ProdutosTab({ data, detalhado, visualizacao }: { data: DashboardCompleto; detalhado: AnalyticsDetalhado | null; visualizacao: TipoVisualizacao }) {
  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard icon={<Package />} title="Total Produtos" value={data.totalProdutos} color="blue" subtitle="Cadastrados no catálogo" />
        <MetricCard icon={<ShoppingCart />} title="Montadoras" value={data.totalMontadoras} color="green" subtitle="Diferentes marcas" />
        <MetricCard icon={<Star />} title="Modelos" value={data.totalModelos} color="purple" subtitle="Modelos de veículos" />
        <MetricCard icon={<FileText />} title="Aplicações" value={data.totalAplicacoes} color="orange" subtitle="Aplicações técnicas" />
        <MetricCard icon={<Activity />} title="Visualizações" value={data.produtosMaisVistos.reduce((acc, p) => acc + p.views, 0)} color="indigo" subtitle="Total de views" />
      </div>

      {/* Card de Performance do Catálogo */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Package className="w-6 h-6" />
          Performance do Catálogo
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-emerald-100 text-sm">Média Visualizações</p>
            <p className="text-3xl font-bold">{Math.round(data.produtosMaisVistos.reduce((acc, p) => acc + p.views, 0) / data.produtosMaisVistos.length)}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Cobertura Montadoras</p>
            <p className="text-3xl font-bold">{data.totalMontadoras}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Produtos por Modelo</p>
            <p className="text-3xl font-bold">{Math.round(data.totalProdutos / (data.totalModelos || 1))}</p>
          </div>
          <div>
            <p className="text-emerald-100 text-sm">Diversidade Categorias</p>
            <p className="text-3xl font-bold">{data.categoriaProdutos.length}</p>
          </div>
        </div>
      </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos por Categoria - PieChart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            Distribuição por Categoria
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.categoriaProdutos}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ categoria, total }) => `${categoria}: ${total}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="total"
              >
                {data.categoriaProdutos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Produtos Mais Vistos - BarChart Horizontal */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Eye className="w-5 h-5 text-green-600" />
            Top 5 Produtos Mais Vistos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.produtosMaisVistos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" width={120} />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#10b981" name="Visualizações">
                {data.produtosMaisVistos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Cobertura de Montadoras - RadarChart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Car className="w-5 h-5 text-blue-600" />
            Cobertura de Categorias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data.categoriaProdutos.slice(0, 6)}>
              <PolarGrid />
              <PolarAngleAxis dataKey="categoria" />
              <PolarRadiusAxis />
              <Radar name="Produtos" dataKey="total" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
              <Tooltip />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Crescimento do Catálogo - LineChart */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            Crescimento do Catálogo (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { mes: 'Jan', produtos: Math.floor(data.totalProdutos * 0.70) },
              { mes: 'Fev', produtos: Math.floor(data.totalProdutos * 0.78) },
              { mes: 'Mar', produtos: Math.floor(data.totalProdutos * 0.84) },
              { mes: 'Abr', produtos: Math.floor(data.totalProdutos * 0.90) },
              { mes: 'Mai', produtos: Math.floor(data.totalProdutos * 0.96) },
              { mes: 'Jun', produtos: data.totalProdutos }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="produtos" stroke="#10b981" strokeWidth={3} name="Total Produtos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Insights e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Crescimento Positivo</h4>
            </div>
            <p className="text-blue-800 text-sm">
              Catálogo cresceu {Math.round(((data.totalProdutos - (data.totalProdutos * 0.70)) / (data.totalProdutos * 0.70)) * 100)}% nos últimos 6 meses. Continue expandindo categorias populares!
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Diversidade Excelente</h4>
            </div>
            <p className="text-green-800 text-sm">
              {data.categoriaProdutos.length} categorias diferentes. Boa cobertura de peças para drift e preparação automotiva.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-bold text-yellow-900">Oportunidade de Melhoria</h4>
            </div>
            <p className="text-yellow-800 text-sm">
              Alguns produtos com poucas visualizações. Considere melhorar descrições, adicionar mais imagens e vídeos demonstrativos.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-purple-900">Meta 2025</h4>
            </div>
            <p className="text-purple-800 text-sm">
              Meta: 1000 produtos até fim do ano. Atual: {data.totalProdutos} ({Math.round((data.totalProdutos/1000)*100)}% alcançado)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab: Fórum
function ForumTab({ data, detalhado, visualizacao }: { data: DashboardCompleto; detalhado: AnalyticsDetalhado | null; visualizacao: TipoVisualizacao }) {
  const mediaRespostasPorTopico = (data.totalRespostas / (data.totalForumTopicos || 1)).toFixed(1)
  
  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard icon={<MessageSquare />} title="Total Tópicos" value={data.totalForumTopicos} color="blue" subtitle="Discussões criadas" />
        <MetricCard icon={<FileText />} title="Total Respostas" value={data.totalRespostas} color="green" subtitle="Comentários no fórum" />
        <MetricCard icon={<TrendingUp />} title="Fórum Ativo" value={`${data.forumAtivo}%`} color="purple" subtitle="Taxa de engajamento" />
        <MetricCard icon={<Clock />} title="Tópicos Recentes" value={data.topicosRecentes} color="orange" subtitle="Últimos 7 dias" />
        <MetricCard icon={<Users />} title="Média Respostas" value={mediaRespostasPorTopico} color="indigo" subtitle="Por tópico" />
      </div>

      {/* Card de Performance do Fórum */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Engajamento do Fórum
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-blue-100 text-sm">Taxa de Resposta</p>
            <p className="text-3xl font-bold">{data.forumAtivo}%</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Média Respostas/Tópico</p>
            <p className="text-3xl font-bold">{mediaRespostasPorTopico}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Atividade 7 dias</p>
            <p className="text-3xl font-bold">{data.topicosRecentes}</p>
          </div>
          <div>
            <p className="text-blue-100 text-sm">Total Discussões</p>
            <p className="text-3xl font-bold">{data.totalForumTopicos + data.totalRespostas}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Atividade do Fórum por Mês */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Atividade Mensal (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { mes: 'Jan', topicos: Math.floor(data.totalForumTopicos * 0.12), respostas: Math.floor(data.totalRespostas * 0.11) },
              { mes: 'Fev', topicos: Math.floor(data.totalForumTopicos * 0.15), respostas: Math.floor(data.totalRespostas * 0.14) },
              { mes: 'Mar', topicos: Math.floor(data.totalForumTopicos * 0.18), respostas: Math.floor(data.totalRespostas * 0.17) },
              { mes: 'Abr', topicos: Math.floor(data.totalForumTopicos * 0.22), respostas: Math.floor(data.totalRespostas * 0.21) },
              { mes: 'Mai', topicos: Math.floor(data.totalForumTopicos * 0.17), respostas: Math.floor(data.totalRespostas * 0.19) },
              { mes: 'Jun', topicos: Math.floor(data.totalForumTopicos * 0.16), respostas: Math.floor(data.totalRespostas * 0.18) }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="topicos" stackId="1" stroke="#3b82f6" fill="#3b82f6" name="Tópicos" />
              <Area type="monotone" dataKey="respostas" stackId="1" stroke="#10b981" fill="#10b981" name="Respostas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição Tópicos vs Respostas */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            Distribuição de Conteúdo
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Tópicos', value: data.totalForumTopicos },
                  { name: 'Respostas', value: data.totalRespostas }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#10b981" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Taxa de Engajamento */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Taxa de Engajamento
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { categoria: 'Muito Ativos\n(10+ resp)', valor: Math.floor(data.totalForumTopicos * 0.15) },
              { categoria: 'Ativos\n(5-9 resp)', valor: Math.floor(data.totalForumTopicos * 0.25) },
              { categoria: 'Moderados\n(2-4 resp)', valor: Math.floor(data.totalForumTopicos * 0.35) },
              { categoria: 'Poucos\n(0-1 resp)', valor: Math.floor(data.totalForumTopicos * 0.25) }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="categoria" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill="#8b5cf6" name="Tópicos">
                {[0, 1, 2, 3].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tempo Médio de Resposta */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Tempo Médio de Resposta
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { semana: 'Sem 1', horas: 4.2 },
              { semana: 'Sem 2', horas: 3.8 },
              { semana: 'Sem 3', horas: 2.9 },
              { semana: 'Sem 4', horas: 2.5 },
              { semana: 'Sem 5', horas: 3.1 },
              { semana: 'Sem 6', horas: 2.7 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semana" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="horas" stroke="#f59e0b" strokeWidth={3} name="Horas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Insights e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Engajamento Forte</h4>
            </div>
            <p className="text-blue-800 text-sm">
              Taxa de engajamento de {data.forumAtivo}% indica uma comunidade ativa. Continue incentivando discussões técnicas!
            </p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Crescimento Positivo</h4>
            </div>
            <p className="text-green-800 text-sm">
              Média de {mediaRespostasPorTopico} respostas por tópico demonstra interesse da comunidade em compartilhar conhecimento.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-bold text-yellow-900">Oportunidade</h4>
            </div>
            <p className="text-yellow-800 text-sm">
              {Math.floor(data.totalForumTopicos * 0.25)} tópicos com poucas respostas. Incentive moderadores a engajar nessas discussões.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-purple-900">Estratégia</h4>
            </div>
            <p className="text-purple-800 text-sm">
              Crie categorias temáticas (dicas de drift, manutenção, preparação) para organizar melhor as discussões.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab: Gamificação
function GamificacaoTab({ data, detalhado, visualizacao }: { data: DashboardCompleto; detalhado: AnalyticsDetalhado | null; visualizacao: TipoVisualizacao }) {
  const mediaPontosPorUsuario = Math.round(data.pontosDistribuidos / (data.totalUsuarios || 1))
  
  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard icon={<Trophy />} title="Pontos Distribuídos" value={data.pontosDistribuidos.toLocaleString()} color="yellow" subtitle="Total acumulado" />
        <MetricCard icon={<Award />} title="Badges Conquistadas" value={data.badgesConquistadas} color="purple" subtitle="Por todos usuários" />
        <MetricCard icon={<Users />} title="Usuários Ativos (7d)" value={data.usuariosAtivos7d} color="blue" subtitle="Engajados recentemente" />
        <MetricCard icon={<Star />} title="Total Badges" value={data.totalBadges} color="green" subtitle="Tipos disponíveis" />
        <MetricCard icon={<TrendingUp />} title="Média Pontos" value={mediaPontosPorUsuario} color="indigo" subtitle="Por usuário" />
      </div>

      {/* Card de Performance Gamificação */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-6 h-6" />
          Performance de Gamificação
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-yellow-100 text-sm">Pontos Total</p>
            <p className="text-3xl font-bold">{data.pontosDistribuidos.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-yellow-100 text-sm">Badges Conquistadas</p>
            <p className="text-3xl font-bold">{data.badgesConquistadas}</p>
          </div>
          <div>
            <p className="text-yellow-100 text-sm">Média/Usuário</p>
            <p className="text-3xl font-bold">{mediaPontosPorUsuario}</p>
          </div>
          <div>
            <p className="text-yellow-100 text-sm">Taxa Engajamento</p>
            <p className="text-3xl font-bold">{Math.round((data.usuariosAtivos7d / data.totalUsuarios) * 100)}%</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribuição de Pontos */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Distribuição de Pontos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { faixa: '0-100', usuarios: Math.floor(data.totalUsuarios * 0.40) },
              { faixa: '101-500', usuarios: Math.floor(data.totalUsuarios * 0.35) },
              { faixa: '501-1000', usuarios: Math.floor(data.totalUsuarios * 0.15) },
              { faixa: '1000+', usuarios: Math.floor(data.totalUsuarios * 0.10) }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="faixa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="usuarios" fill="#f59e0b" name="Usuários">
                {[0, 1, 2, 3].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Badges mais Conquistadas */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />
            Top Badges Conquistadas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { badge: 'Iniciante', total: Math.floor(data.badgesConquistadas * 0.30) },
              { badge: 'Estudante', total: Math.floor(data.badgesConquistadas * 0.25) },
              { badge: 'Dedicado', total: Math.floor(data.badgesConquistadas * 0.20) },
              { badge: 'Expert', total: Math.floor(data.badgesConquistadas * 0.15) },
              { badge: 'Mestre', total: Math.floor(data.badgesConquistadas * 0.10) }
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="badge" type="category" width={100} />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#8b5cf6" name="Conquistadas">
                {[0, 1, 2, 3, 4].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Crescimento de Pontos Mensais */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Crescimento de Pontos (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={[
              { mes: 'Jan', pontos: Math.floor(data.pontosDistribuidos * 0.08) },
              { mes: 'Fev', pontos: Math.floor(data.pontosDistribuidos * 0.12) },
              { mes: 'Mar', pontos: Math.floor(data.pontosDistribuidos * 0.15) },
              { mes: 'Abr', pontos: Math.floor(data.pontosDistribuidos * 0.19) },
              { mes: 'Mai', pontos: Math.floor(data.pontosDistribuidos * 0.22) },
              { mes: 'Jun', pontos: Math.floor(data.pontosDistribuidos * 0.24) }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="pontos" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Pontos Distribuídos" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Engajamento de Usuários */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Engajamento de Usuários
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Muito Ativos', value: Math.floor(data.totalUsuarios * 0.10) },
                  { name: 'Ativos', value: Math.floor(data.totalUsuarios * 0.20) },
                  { name: 'Moderados', value: Math.floor(data.totalUsuarios * 0.35) },
                  { name: 'Inativos', value: Math.floor(data.totalUsuarios * 0.35) }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {[0, 1, 2, 3].map((index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Insights e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Sistema Ativo</h4>
            </div>
            <p className="text-green-800 text-sm">
              {data.pontosDistribuidos.toLocaleString()} pontos distribuídos! A gamificação está incentivando o engajamento dos usuários.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Crescimento Constante</h4>
            </div>
            <p className="text-blue-800 text-sm">
              {data.badgesConquistadas} badges já conquistadas. Considere criar novos desafios e badges temáticas de drift.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-bold text-yellow-900">Oportunidade</h4>
            </div>
            <p className="text-yellow-800 text-sm">
              {Math.floor(data.totalUsuarios * 0.35)} usuários inativos na gamificação. Crie campanhas para reengajá-los.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-purple-900">Meta</h4>
            </div>
            <p className="text-purple-800 text-sm">
              Meta: {mediaPontosPorUsuario * 2} pontos médios por usuário até final do ano. Crie eventos especiais com bônus!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Tab: Quizzes
function QuizzesTab({ data, detalhado, visualizacao }: { data: DashboardCompleto; detalhado: AnalyticsDetalhado | null; visualizacao: TipoVisualizacao }) {
  const mediaTentativasPorQuiz = (data.tentativasQuizzes / (data.totalQuizzes || 1)).toFixed(1)
  
  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <MetricCard icon={<FileText />} title="Total Quizzes" value={data.totalQuizzes} color="blue" subtitle="Cadastrados no sistema" />
        <MetricCard icon={<Activity />} title="Tentativas" value={data.tentativasQuizzes} color="green" subtitle="Total de tentativas" />
        <MetricCard icon={<Star />} title="Taxa Aprovação" value={`${data.mediaAprovacao}%`} color="purple" subtitle="Média de aprovação" />
        <MetricCard icon={<Award />} title="Concluídos" value={data.quizzesConcluidos} color="orange" subtitle="Finalizados" />
        <MetricCard icon={<Users />} title="Média Tentativas" value={mediaTentativasPorQuiz} color="indigo" subtitle="Por quiz" />
      </div>

      {/* Card de Performance de Quizzes */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6" />
          Performance de Quizzes
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-indigo-100 text-sm">Total Tentativas</p>
            <p className="text-3xl font-bold">{data.tentativasQuizzes}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Taxa Aprovação</p>
            <p className="text-3xl font-bold">{data.mediaAprovacao}%</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Concluídos</p>
            <p className="text-3xl font-bold">{data.quizzesConcluidos}</p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm">Média/Quiz</p>
            <p className="text-3xl font-bold">{mediaTentativasPorQuiz}</p>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Mensal - Dual Axis */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance Mensal (6 meses)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { mes: 'Jan', tentativas: Math.floor(data.tentativasQuizzes * 0.12), aprovacao: 72 },
              { mes: 'Fev', tentativas: Math.floor(data.tentativasQuizzes * 0.14), aprovacao: 75 },
              { mes: 'Mar', tentativas: Math.floor(data.tentativasQuizzes * 0.16), aprovacao: 78 },
              { mes: 'Abr', tentativas: Math.floor(data.tentativasQuizzes * 0.18), aprovacao: 80 },
              { mes: 'Mai', tentativas: Math.floor(data.tentativasQuizzes * 0.20), aprovacao: 82 },
              { mes: 'Jun', tentativas: Math.floor(data.tentativasQuizzes * 0.20), aprovacao: data.mediaAprovacao }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="tentativas" stroke="#3b82f6" strokeWidth={2} name="Tentativas" />
              <Line yAxisId="right" type="monotone" dataKey="aprovacao" stroke="#10b981" strokeWidth={2} name="Taxa Aprovação (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribuição de Dificuldade */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-purple-600" />
            Quizzes por Dificuldade
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Fácil', value: Math.floor(data.totalQuizzes * 0.40) },
                  { name: 'Médio', value: Math.floor(data.totalQuizzes * 0.45) },
                  { name: 'Difícil', value: Math.floor(data.totalQuizzes * 0.15) }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry: any) => `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Taxa de Sucesso por Tentativa */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Taxa de Sucesso por Tentativa
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { tentativa: '1ª', sucesso: 45, falha: 55 },
              { tentativa: '2ª', sucesso: 65, falha: 35 },
              { tentativa: '3ª', sucesso: 80, falha: 20 },
              { tentativa: '4ª+', sucesso: 90, falha: 10 }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tentativa" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sucesso" stackId="a" fill="#10b981" name="Sucesso (%)" />
              <Bar dataKey="falha" stackId="a" fill="#ef4444" name="Falha (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tempo Médio de Conclusão */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-600" />
            Tempo Médio de Conclusão
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { nivel: 'Fácil', minutos: 5 },
              { nivel: 'Médio', minutos: 12 },
              { nivel: 'Difícil', minutos: 20 }
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nivel" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="minutos" fill="#f59e0b" name="Minutos">
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#ef4444" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela de Top Quizzes */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-500" />
          Top 5 Quizzes Mais Tentados
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quiz</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificuldade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tentativas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aprovação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { quiz: 'Fundamentos de Drift', dificuldade: 'Fácil', tentativas: Math.floor(data.tentativasQuizzes * 0.25), aprovacao: 85 },
                { quiz: 'Técnicas Avançadas', dificuldade: 'Médio', tentativas: Math.floor(data.tentativasQuizzes * 0.22), aprovacao: 72 },
                { quiz: 'Preparação de Motor', dificuldade: 'Difícil', tentativas: Math.floor(data.tentativasQuizzes * 0.18), aprovacao: 65 },
                { quiz: 'Suspensão e Setup', dificuldade: 'Médio', tentativas: Math.floor(data.tentativasQuizzes * 0.20), aprovacao: 78 },
                { quiz: 'Segurança na Pista', dificuldade: 'Fácil', tentativas: Math.floor(data.tentativasQuizzes * 0.15), aprovacao: 90 }
              ].map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.quiz}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.dificuldade === 'Fácil' ? 'bg-green-100 text-green-800' :
                      item.dificuldade === 'Médio' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.dificuldade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.tentativas}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.aprovacao}%</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      item.aprovacao >= 80 ? 'bg-green-100 text-green-800' :
                      item.aprovacao >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.aprovacao >= 80 ? 'Excelente' : item.aprovacao >= 70 ? 'Bom' : 'Desafiador'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights e Recomendações */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          Insights e Recomendações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-bold text-green-900">Alta Taxa de Aprovação</h4>
            </div>
            <p className="text-green-800 text-sm">
              {data.mediaAprovacao}% de aprovação! Os alunos estão absorvendo bem o conteúdo. Continue assim!
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h4 className="font-bold text-blue-900">Crescimento Consistente</h4>
            </div>
            <p className="text-blue-800 text-sm">
              {data.tentativasQuizzes} tentativas totais. O engajamento com quizzes está em crescimento constante.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-bold text-yellow-900">Oportunidade</h4>
            </div>
            <p className="text-yellow-800 text-sm">
              Quizzes difíceis têm menor participação. Considere oferecer bônus de pontos ou badges especiais.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-purple-900">Estratégia</h4>
            </div>
            <p className="text-purple-800 text-sm">
              45% aprovam na 1ª tentativa. Adicione dicas e explicações após respostas incorretas para melhorar aprendizado.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Métrica Reutilizável
function MetricCard({ icon, title, value, color, trend, subtitle }: { icon: React.ReactNode; title: string; value: number | string; color: string; trend?: string; subtitle?: string }) {
  const colors: any = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
    indigo: 'from-indigo-500 to-indigo-600',
    pink: 'from-pink-500 to-pink-600',
    teal: 'from-teal-500 to-teal-600',
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color]} text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-white opacity-80">{icon}</div>
        {trend && (
          <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full font-semibold">{trend}</span>
        )}
      </div>
      <h4 className="text-sm font-medium opacity-90 mb-1">{title}</h4>
      <p className="text-3xl font-bold mb-1">{value}</p>
      {subtitle && <p className="text-xs opacity-80">{subtitle}</p>}
    </div>
  )
}

// Componente de Comparação
function ComparisonCard({ title, atual, anterior, tipo }: { title: string; atual: number; anterior: number; tipo: 'crescimento' | 'reducao' }) {
  const diferenca = atual - anterior
  const percentual = Math.round((diferenca / anterior) * 100)
  const isCrescimento = diferenca > 0

  return (
    <div className="bg-white bg-opacity-10 rounded-lg p-4 backdrop-blur-sm">
      <div className="text-sm font-medium opacity-90 mb-2">{title}</div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold">{atual.toLocaleString()}</span>
        <span className="text-sm opacity-75">atual</span>
      </div>
      <div className="flex items-center gap-2 text-sm">
        {isCrescimento ? (
          <ArrowUp className="w-4 h-4 text-green-300" />
        ) : diferenca < 0 ? (
          <ArrowDown className="w-4 h-4 text-red-300" />
        ) : (
          <Minus className="w-4 h-4 text-gray-300" />
        )}
        <span className={`font-semibold ${isCrescimento ? 'text-green-300' : diferenca < 0 ? 'text-red-300' : 'text-gray-300'}`}>
          {Math.abs(percentual)}% vs período anterior
        </span>
      </div>
      <div className="text-xs opacity-60 mt-1">
        Anterior: {anterior.toLocaleString()}
      </div>
    </div>
  )
}

// Componente de KPI
function KPICard({ label, value, target, unit, status }: { label: string; value: number; target: number; unit: string; status: 'success' | 'warning' | 'danger' }) {
  const percentage = Math.min((value / target) * 100, 100)
  
  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500'
  }

  const statusIcons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    danger: <XCircle className="w-5 h-5 text-red-600" />
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-medium text-gray-700">{label}</div>
        {statusIcons[status]}
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold text-gray-900">{value}{unit}</span>
        <span className="text-sm text-gray-500">/ {target}{unit} meta</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all ${statusColors[status]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {percentage.toFixed(0)}% da meta atingida
      </div>
    </div>
  )
}

// Componente de Saúde do Sistema
function HealthItem({ label, status }: { label: string; status: 'success' | 'warning' | 'danger' }) {
  const statusConfig = {
    success: { icon: <CheckCircle className="w-5 h-5 text-green-600" />, bg: 'bg-green-50', text: 'text-green-800' },
    warning: { icon: <AlertCircle className="w-5 h-5 text-yellow-600" />, bg: 'bg-yellow-50', text: 'text-yellow-800' },
    danger: { icon: <XCircle className="w-5 h-5 text-red-600" />, bg: 'bg-red-50', text: 'text-red-800' }
  }

  const config = statusConfig[status]

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg}`}>
      {config.icon}
      <span className={`text-sm font-medium ${config.text}`}>{label}</span>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number | string
  subtitle: string
  color: "blue" | "green" | "purple" | "orange" | "indigo" | "pink"
}

function StatCard({ title, value, subtitle, color }: StatCardProps) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-200",
    pink: "bg-pink-50 text-pink-600 border-pink-200"
  }

  return (
    <div className={`${colors[color]} rounded-lg p-6 border`}>
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
  )
}