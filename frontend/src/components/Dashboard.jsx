import { useAuth } from '../context/AuthContext'

export default function Dashboard({ activeView, onNavigate, children }) {
  const { email, logout } = useAuth()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">MS</span>
          <span>MiniStock</span>
        </div>

        <nav className="nav" aria-label="Navegacion principal">
          <button
            type="button"
            className={activeView === 'dashboard' ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate('dashboard')}
          >
            Panel
          </button>
          <button
            type="button"
            className={activeView === 'products' ? 'nav-item active' : 'nav-item'}
            onClick={() => onNavigate('products')}
          >
            Productos
          </button>
        </nav>

        <div className="topbar-right">
          <span className="user-email">{email}</span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      <main className="main-content">{children}</main>
    </div>
  )
}
