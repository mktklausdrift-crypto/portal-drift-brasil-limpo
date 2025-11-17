"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface BadgeToastProps {
  nome: string
  descricao: string
  icone: string
  cor: string
  pontos?: number
  onClose: () => void
  duration?: number // em ms, padrão 5000
}

export function BadgeToast({
  nome,
  descricao,
  icone,
  cor,
  pontos,
  onClose,
  duration = 5000
}: BadgeToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300) // Aguarda animação
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!visible) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed top-4 right-4 z-50 max-w-sm"
        initial={{ opacity: 0, x: 100, scale: 0.8 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 100, scale: 0.8 }}
        transition={{ type: "spring", duration: 0.5 }}
      >
        <div className="bg-white rounded-lg shadow-2xl border-2 border-yellow-400 p-4 relative overflow-hidden">
          {/* Fundo animado */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-orange-400/10"
            animate={{ x: [-100, 100] }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          />

          {/* Botão de fechar */}
          <button
            onClick={() => setVisible(false)}
            className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          {/* Conteúdo */}
          <div className="relative">
            {/* Header */}
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                style={{ backgroundColor: cor }}
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {icone}
              </motion.div>
              
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  🎉 Nova Conquista!
                </h3>
                <p className="font-semibold text-primary text-lg">{nome}</p>
              </div>
            </div>

            {/* Descrição */}
            <p className="text-gray-600 text-sm mb-3">{descricao}</p>

            {/* Pontos */}
            {pontos && (
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-bold text-yellow-600">
                  +{pontos} pontos!
                </span>
              </div>
            )}

            {/* Barra de progresso */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-yellow-400 to-orange-400"
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{ duration: duration / 1000, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
