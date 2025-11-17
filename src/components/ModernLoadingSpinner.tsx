interface ModernLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function ModernLoadingSpinner({ 
  size = 'md', 
  label = 'Carregando conteúdo...' 
}: ModernLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  }
  
  const dotSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  }

  return (
    <div 
      className="flex items-center justify-center py-12"
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="relative">
        {/* Outer ring */}
        <div className={`${sizeClasses[size]} border-4 border-blue-200 dark:border-blue-900 rounded-full`}></div>
        
        {/* Spinning gradient ring */}
        <div 
          className={`absolute top-0 left-0 ${sizeClasses[size]} border-4 border-transparent border-t-blue-600 rounded-full animate-spin`}
          aria-hidden="true"
        ></div>
        
        {/* Inner pulsing dot */}
        <div 
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ${dotSizeClasses[size]} bg-blue-600 rounded-full animate-pulse`}
          aria-hidden="true"
        ></div>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  )
}
