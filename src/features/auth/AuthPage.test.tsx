import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { AuthProvider } from './AuthContext'
import { AuthPage } from './AuthPage'
import { ThemeProvider } from '../theme/ThemeContext'

afterEach(cleanup)

describe('AuthPage', () => {
  function renderPage() {
    return render(<MemoryRouter><ThemeProvider><AuthProvider><AuthPage /></AuthProvider></ThemeProvider></MemoryRouter>)
  }

  it('muestra el acceso principal', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: 'Bienvenido de nuevo' })).toBeTruthy()
    expect(screen.getByPlaceholderText('tu@correo.com')).toBeTruthy()
  })

  it('registra clientes sin pedir una barbería o una sede', async () => {
    renderPage()
    fireEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }))
    expect(await screen.findByRole('heading', { name: 'Crea tu cuenta' })).toBeTruthy()
    expect(screen.queryByText('Código de la barbería')).toBeNull()
    expect(screen.getByLabelText('Nombre completo')).toBeTruthy()
  })
})
