import { render, screen } from '@testing-library/react'
import { SessionProvider } from 'next-auth/react'
import Header from '@/components/layout/header'

// Mock useSession para diferentes cenários
const mockUseSession = jest.fn()

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}))

// Mock Next.js Image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}))

describe('Header Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the logo and company name', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    render(<Header />)
    
    expect(screen.getByAltText('Drift Brasil')).toBeInTheDocument()
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
  })

  it('shows navigation links when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'STUDENT'
        }
      },
      status: 'authenticated'
    })

    render(<Header />)
    
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
    expect(screen.getByText('Capacitação')).toBeInTheDocument()
    expect(screen.getByText('Fórum Técnico')).toBeInTheDocument()
  })

  it('shows loading state correctly', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading'
    })

    render(<Header />)
    
    // Should show navigation links even while loading
    expect(screen.getByText('Catálogo')).toBeInTheDocument()
  })
})