import { useEffect, useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './components/LoginPage'
import Dashboard from './components/Dashboard'
import ProductsPage from './components/ProductsPage'

function Home() {
  const { email } = useAuth()
  return (
    <section className="card welcome">
      <h2>Bienvenido a MiniStock</h2>
      <p>
        Sesi&oacute;n iniciada como <strong>{email}</strong>.
      </p>
      <p>Usa la opci&oacute;n &laquo;Productos&raquo; del men&uacute; para gestionar el inventario.</p>
    </section>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()
  const [view, setView] = useState('dashboard')

  useEffect(() => {
    if (!isAuthenticated) {
      setView('dashboard')
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Dashboard activeView={view} onNavigate={setView}>
      {view === 'products' ? <ProductsPage /> : <Home />}
    </Dashboard>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
