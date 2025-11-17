import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RequireRole from '@/components/auth/RequireRole'

const mockPush = jest.fn()
const mockUseSession = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

jest.mock('next-auth/react', () => ({
  useSession: () => mockUseSession(),
}))

describe('RequireRole Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders children when user has required role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          role: 'ADMIN'
        }
      },
      status: 'authenticated'
    })

    render(
      <RequireRole roles={['ADMIN']}>
        <div>Admin Content</div>
      </RequireRole>
    )

    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('shows access denied for insufficient permissions', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          role: 'STUDENT'
        }
      },
      status: 'authenticated'
    })

    render(
      <RequireRole roles={['ADMIN']}>
        <div>Admin Content</div>
      </RequireRole>
    )

    expect(screen.getByText('Acesso Negado')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('shows loading spinner during authentication', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading'
    })

    render(
      <RequireRole roles={['ADMIN']}>
        <div>Admin Content</div>
      </RequireRole>
    )

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('redirects unauthenticated users to signin', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated'
    })

    render(
      <RequireRole roles={['ADMIN']}>
        <div>Admin Content</div>
      </RequireRole>
    )

    expect(mockPush).toHaveBeenCalledWith('/auth/signin')
  })

  it('renders fallback component when provided', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          role: 'STUDENT'
        }
      },
      status: 'authenticated'
    })

    render(
      <RequireRole 
        roles={['ADMIN']} 
        fallback={<div>Custom Fallback</div>}
      >
        <div>Admin Content</div>
      </RequireRole>
    )

    expect(screen.getByText('Custom Fallback')).toBeInTheDocument()
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument()
  })

  it('allows multiple roles', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: {
          id: '1',
          role: 'INSTRUCTOR'
        }
      },
      status: 'authenticated'
    })

    render(
      <RequireRole roles={['ADMIN', 'INSTRUCTOR']}>
        <div>Instructor Content</div>
      </RequireRole>
    )

    expect(screen.getByText('Instructor Content')).toBeInTheDocument()
  })
})