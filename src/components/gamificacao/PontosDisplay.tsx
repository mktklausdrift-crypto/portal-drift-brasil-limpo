"use client"

import { motion } from "framer-motion"

interface PontosDisplayProps {
  pontos: number
  className?: string
  size?: "sm" | "md" | "lg"
  showAnimation?: boolean
}

export function PontosDisplay({ 
  pontos, 
  className = "", 
  size = "md",
  showAnimation = true 
}: PontosDisplayProps) {
  const sizeClasses = {
    sm: "text-lg px-3 py-1",
    md: "text-xl px-4 py-2", 
    lg: "text-2xl px-6 py-3"
  }

  return (
    <motion.div
      className={`inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white font-bold rounded-full shadow-lg ${sizeClasses[size]} ${className}`}
      initial={showAnimation ? { scale: 0 } : {}}
      animate={showAnimation ? { scale: 1 } : {}}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", duration: 0.3 }}
    >
      <span className="text-2xl">⭐</span>
      <span>{pontos.toLocaleString('pt-BR')} pts</span>
    </motion.div>
  )
}

interface RankingCardProps {
  posicao: number
  usuario: {
    id: string
    name: string
    image?: string
    pontos: number
  }
  isCurrentUser?: boolean
  className?: string
}

export function RankingCard({ 
  posicao, 
  usuario, 
  isCurrentUser = false,
  className = "" 
}: RankingCardProps) {
  const getPosicaoIcon = (pos: number) => {
    switch (pos) {
      case 1: return "🥇"
      case 2: return "🥈"
      case 3: return "🥉"
      default: return `${pos}º`
    }
  }

  const getPosicaoColor = (pos: number) => {
    switch (pos) {
      case 1: return "from-yellow-400 to-yellow-600"
      case 2: return "from-gray-300 to-gray-500"
      case 3: return "from-orange-400 to-orange-600"
      default: return "from-blue-400 to-blue-600"
    }
  }

  return (
    <motion.div
      className={`flex items-center gap-4 p-4 rounded-lg shadow-md transition-all duration-300 ${
        isCurrentUser 
          ? "bg-gradient-to-r from-primary/10 to-primary/5 ring-2 ring-primary" 
          : "bg-white hover:shadow-lg"
      } ${className}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: posicao * 0.1 }}
    >
      {/* Posição */}
      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${getPosicaoColor(posicao)} flex items-center justify-center text-white font-bold`}>
        {typeof getPosicaoIcon(posicao) === "string" && posicao <= 3 ? (
          <span className="text-2xl">{getPosicaoIcon(posicao)}</span>
        ) : (
          <span className="text-sm">{getPosicaoIcon(posicao)}</span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
        {usuario.image ? (
          <img 
            src={usuario.image} 
            alt={usuario.name || "Usuário"} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold">
            {(usuario.name || "U").charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Nome */}
      <div className="flex-1">
        <h4 className={`font-semibold ${isCurrentUser ? "text-primary" : "text-gray-900"}`}>
          {usuario.name || "Usuário Anônimo"}
          {isCurrentUser && <span className="text-sm text-primary ml-2">(Você)</span>}
        </h4>
      </div>

      {/* Pontos */}
      <PontosDisplay pontos={usuario.pontos} size="sm" showAnimation={false} />
    </motion.div>
  )
}

interface ProgressoGamificacaoProps {
  pontosAtuais: number
  proximoNivel: number
  niveisDisponiveis: Array<{
    nivel: number
    pontosNecessarios: number
    nome: string
    cor: string
  }>
  className?: string
}

export function ProgressoGamificacao({
  pontosAtuais,
  proximoNivel,
  niveisDisponiveis,
  className = ""
}: ProgressoGamificacaoProps) {
  const nivelAtual = niveisDisponiveis
    .filter(n => pontosAtuais >= n.pontosNecessarios)
    .pop() || niveisDisponiveis[0]

  const proximoNivelData = niveisDisponiveis.find(n => n.nivel === proximoNivel)
  
  const progresso = proximoNivelData 
    ? Math.min(100, (pontosAtuais / proximoNivelData.pontosNecessarios) * 100)
    : 100

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Nível Atual</h3>
          <p className="text-sm text-gray-600">{nivelAtual.nome}</p>
        </div>
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl"
          style={{ backgroundColor: nivelAtual.cor }}
        >
          {nivelAtual.nivel}
        </div>
      </div>

      {/* Barra de progresso */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Progresso para o próximo nível
          </span>
          <span className="text-sm text-gray-500">
            {pontosAtuais} / {proximoNivelData?.pontosNecessarios || pontosAtuais} pts
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-3">
          <motion.div
            className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
            initial={{ width: 0 }}
            animate={{ width: `${progresso}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </div>

      {/* Próximo nível */}
      {proximoNivelData && progresso < 100 && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">
              {proximoNivelData.pontosNecessarios - pontosAtuais} pontos
            </span>{" "}
            para alcançar <span className="font-semibold">{proximoNivelData.nome}</span>
          </p>
        </div>
      )}
    </motion.div>
  )
}