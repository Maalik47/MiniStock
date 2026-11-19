import { createContext, useContext, useEffect, useState } from 'react'
import { login as loginRequest } from '../api/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('ministock_token'))
  const [email, setEmail] = useState(() => localStorage.getItem('ministock_email'))

  useEffect(() => {
    const handleUnauthorized = () => {
      setToken(null)
      setEmail(null)
    }
    window.addEventListener('ministock:unauthorized', handleUnauthorized)
    return () => window.removeEventListener('ministock:unauthorized', handleUnauthorized)
  }, [])

  const login = async (credentials) => {
    const { data } = await loginRequest(credentials)
    localStorage.setItem('ministock_token', data.token)
    localStorage.setItem('ministock_email', data.email)
    setToken(data.token)
    setEmail(data.email)
  }

  const logout = () => {
    localStorage.removeItem('ministock_token')
    localStorage.removeItem('ministock_email')
    setToken(null)
    setEmail(null)
  }

  return (
    <AuthContext.Provider value={{ token, email, isAuthenticated: Boolean(token), login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de AuthProvider')
  }
  return context
}
