// Accessibility Utilities - Portal Klaus Drift Brasil
// Utilitários para melhorar acessibilidade e conformidade WCAG 2.1

import { useEffect, useState, useRef, KeyboardEvent } from 'react';

/**
 * Hook para gerenciar foco de teclado
 * Facilita navegação por keyboard
 */
export function useFocusManagement() {
  const containerRef = useRef<HTMLElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: Event) => {
      const keyEvent = e as unknown as KeyboardEvent;
      if (keyEvent.key !== 'Tab') return;

      if (keyEvent.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, []);

  return containerRef;
}

/**
 * Hook para anúncios de screen reader
 * Utiliza aria-live regions
 */
export function useScreenReaderAnnouncement() {
  const [announcement, setAnnouncement] = useState('');
  const [politeness, setPoliteness] = useState<'polite' | 'assertive'>('polite');

  const announce = (message: string, level: 'polite' | 'assertive' = 'polite') => {
    setAnnouncement('');
    setPoliteness(level);
    
    setTimeout(() => {
      setAnnouncement(message);
    }, 100);
  };

  const AnnouncementRegion = () => (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );

  return { announce, AnnouncementRegion };
}

/**
 * Hook para detectar preferências de acessibilidade do usuário
 */
export function useAccessibilityPreferences() {
  const [preferences, setPreferences] = useState({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
  });

  useEffect(() => {
    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        prefersHighContrast: window.matchMedia('(prefers-contrast: high)').matches,
        prefersDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      });
    };

    updatePreferences();

    // Listeners para mudanças
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

    motionQuery.addEventListener('change', updatePreferences);
    contrastQuery.addEventListener('change', updatePreferences);
    darkModeQuery.addEventListener('change', updatePreferences);

    return () => {
      motionQuery.removeEventListener('change', updatePreferences);
      contrastQuery.removeEventListener('change', updatePreferences);
      darkModeQuery.removeEventListener('change', updatePreferences);
    };
  }, []);

  return preferences;
}

/**
 * Hook para trap de foco em modais
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focar primeiro elemento ao abrir
    firstElement?.focus();

    const handleKeyDown = (e: Event) => {
      const keyEvent = e as unknown as KeyboardEvent;
      if (keyEvent.key !== 'Tab') return;

      if (keyEvent.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => container.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
}

/**
 * Gerar ID único para associação aria-describedby
 */
export function useAriaId(prefix: string = 'aria') {
  const [id] = useState(() => `${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return id;
}

/**
 * Verificar contraste de cores (WCAG AA)
 */
export function checkColorContrast(foreground: string, background: string): {
  ratio: number;
  AA: boolean;
  AAA: boolean;
} {
  const getLuminance = (color: string) => {
    const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
    const [r, g, b] = rgb.map(val => {
      const normalized = val / 255;
      return normalized <= 0.03928
        ? normalized / 12.92
        : Math.pow((normalized + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  return {
    ratio: Math.round(ratio * 100) / 100,
    AA: ratio >= 4.5,   // Normal text
    AAA: ratio >= 7,    // Enhanced contrast
  };
}

/**
 * Componente de Skip Link para navegação rápida
 */
export function SkipToContent({ targetId = 'main-content' }: { targetId?: string }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-orange-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
    >
      Pular para o conteúdo principal
    </a>
  );
}

/**
 * Classe utilitária para elementos visíveis apenas para screen readers
 */
export const srOnlyClass = 'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 clip-rect-0';

/**
 * Hook para gerenciar estado de loading com feedback de acessibilidade
 */
export function useAccessibleLoading(isLoading: boolean, message: string = 'Carregando...') {
  const { announce } = useScreenReaderAnnouncement();

  useEffect(() => {
    if (isLoading) {
      announce(message, 'polite');
    }
  }, [isLoading, message, announce]);

  return {
    'aria-busy': isLoading,
    'aria-live': 'polite' as const,
  };
}

/**
 * Validar hierarquia de headings (h1, h2, h3, etc.)
 */
export function validateHeadingHierarchy(): {
  valid: boolean;
  errors: string[];
} {
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  const errors: string[] = [];
  let previousLevel = 0;

  // Deve ter apenas um h1
  const h1Count = document.querySelectorAll('h1').length;
  if (h1Count === 0) {
    errors.push('Página deve ter pelo menos um heading h1');
  } else if (h1Count > 1) {
    errors.push('Página deve ter apenas um heading h1');
  }

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName[1]);
    
    if (index === 0 && level !== 1) {
      errors.push('Primeiro heading deve ser h1');
    }
    
    if (previousLevel > 0 && level > previousLevel + 1) {
      errors.push(`Heading skip detectado: h${previousLevel} para h${level}`);
    }
    
    previousLevel = level;
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Adicionar suporte a navegação por teclado em elementos customizados
 */
export function makeKeyboardAccessible(
  onClick: () => void,
  role: string = 'button'
) {
  return {
    role,
    tabIndex: 0,
    onClick,
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick();
      }
    },
  };
}

/**
 * Componente de Progress Bar acessível
 */
export function AccessibleProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
}: {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
}) {
  const percentage = Math.round((value / max) * 100);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span id="progress-label" className="text-sm font-medium">
          {label}
        </span>
        {showValue && (
          <span className="text-sm text-gray-600" aria-hidden="true">
            {percentage}%
          </span>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-labelledby="progress-label"
        aria-valuetext={`${percentage}% completo`}
        className="w-full bg-gray-200 rounded-full h-2 overflow-hidden"
      >
        <div
          className="bg-orange-600 h-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Utilitário para criar mensagens de erro acessíveis
 */
export function createAccessibleError(fieldId: string, errorMessage: string) {
  return {
    id: `${fieldId}-error`,
    role: 'alert',
    'aria-live': 'assertive' as const,
    children: errorMessage,
  };
}

/**
 * Validar se elemento tem label adequado
 */
export function validateFormLabels(): {
  valid: boolean;
  errors: string[];
} {
  const inputs = document.querySelectorAll('input, select, textarea');
  const errors: string[] = [];

  inputs.forEach((input) => {
    const hasLabel = 
      input.hasAttribute('aria-label') ||
      input.hasAttribute('aria-labelledby') ||
      (input.id && document.querySelector(`label[for="${input.id}"]`));

    if (!hasLabel) {
      errors.push(`Input sem label: ${input.outerHTML.substring(0, 50)}...`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

export default {
  useFocusManagement,
  useScreenReaderAnnouncement,
  useAccessibilityPreferences,
  useFocusTrap,
  useAriaId,
  checkColorContrast,
  SkipToContent,
  useAccessibleLoading,
  validateHeadingHierarchy,
  makeKeyboardAccessible,
  AccessibleProgressBar,
  createAccessibleError,
  validateFormLabels,
};