"use client"

import { motion } from "framer-motion"

interface BadgeCardProps {
  nome: string
  descricao: string
  icone: string
  cor: string
  desbloqueada: boolean
  desbloqueadaEm?: Date
  categoria: string
  className?: string
}

export function BadgeCard({
  nome,
  descricao,
  icone,
  cor,
  desbloqueada,
  desbloqueadaEm,
  categoria,
  className = ""
}: BadgeCardProps) {
  return (
    <motion.div
      className={`relative bg-white rounded-lg shadow-md p-4 transition-all duration-300 ${
        desbloqueada 
          ? "ring-2 ring-yellow-400 shadow-lg" 
          : "opacity-60 grayscale"
      } ${className}`}
      whileHover={desbloqueada ? { scale: 1.05 } : {}}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Badge de categoria */}
      <div className="absolute -top-2 -right-2">
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {categoria}
        </span>
      </div>

      {/* Ícone da conquista */}
      <div className="flex justify-center mb-3">
        <div 
          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
          style={{ backgroundColor: desbloqueada ? cor : '#E5E7EB' }}
        >
          {icone}
        </div>
      </div>

      {/* Informações */}
      <div className="text-center">
        <h3 className="font-bold text-gray-900 mb-1">{nome}</h3>
        <p className="text-sm text-gray-600 mb-2">{descricao}</p>
        
        {desbloqueada && desbloqueadaEm && (
          <p className="text-xs text-green-600 font-medium">
            Desbloqueada em {desbloqueadaEm.toLocaleDateString('pt-BR')}
          </p>
        )}
        
        {!desbloqueada && (
          <p className="text-xs text-gray-400 font-medium">
            Ainda não desbloqueada
          </p>
        )}
      </div>

      {/* Efeito de brilho para conquistas desbloqueadas */}
      {desbloqueada && (
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-400/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}
    </motion.div>
  )
}
