"use client"

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { NotificacaoDropdown } from '@/components/notificacoes/NotificacaoDropdown';
import { useState } from 'react';
import { SkipToContent } from '@/lib/accessibility';

type NavLink = {
  href: string;
  label: string;
  ariaLabel: string;
  size: 'base' | 'sm';
};

const navLinks: NavLink[] = [
  { href: '/', label: 'Início', ariaLabel: 'Ir para início', size: 'base' },
  { href: '/sobre', label: 'A Empresa', ariaLabel: 'Sobre a empresa', size: 'base' },
  { href: '/pecas', label: 'Catálogo', ariaLabel: 'Catálogo de peças OEM', size: 'sm' },
  { href: '/noticias', label: 'Notícias', ariaLabel: 'Notícias', size: 'sm' },
  { href: '/cursos', label: 'Capacitação', ariaLabel: 'Cursos de capacitação', size: 'sm' },
  { href: '/forum', label: 'Fórum Técnico', ariaLabel: 'Fórum técnico da comunidade', size: 'sm' },
];

const getNavLinkClasses = (size: 'base' | 'sm') =>
  size === 'base'
    ? 'nav-link font-semibold text-black text-base whitespace-nowrap px-3 py-1 rounded transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
    : 'nav-link font-semibold text-black text-sm whitespace-nowrap px-2 py-1 rounded transition-colors duration-200 hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2';

export default function Header() {
  const { data: session, status } = useSession();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isLoading = status === 'loading';

  return (
    <>
      <SkipToContent targetId="main-content" />
      <header 
        className="bg-white border-b-2 border-primary text-black shadow-md sticky top-0 z-50"
        role="banner"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-8 py-0.5">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center group flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md"
            aria-label="Drift Brasil - Ir para página inicial"
          >
            <Image
              src="/logo-drift-brasil.png"
              alt="Drift Brasil"
              width={85}
              height={28}
              loading="lazy"
              className="h-7 w-auto object-contain object-left drop-shadow header-logo"
            />
          </Link>
          
          {/* Navigation - Desktop */}
          <nav 
            className="hidden lg:flex items-center gap-6 header-nav ml-6"
            role="navigation"
            aria-label="Navegação principal"
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={getNavLinkClasses(link.size)}
                aria-label={link.ariaLabel}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          
          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {!isLoading && session && <NotificacaoDropdown />}
            
            <Link 
              href="/contato" 
              className="px-4 py-1 rounded bg-primary text-white font-bold shadow hover:bg-primary-hover transition-colors duration-200 text-base whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Solicitar orçamento"
            >
              Orçamento
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
