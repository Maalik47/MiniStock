import { useCallback, useEffect, useState } from 'react'
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../api/api'
import ProductForm from './ProductForm'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [editing, setEditing] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(true)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await getProducts()
      setProducts(data)
    } catch {
      setMessage({ type: 'error', text: 'No se pudo cargar la lista de productos.' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const handleEdit = async (id) => {
    setMessage({ type: '', text: '' })
    try {
      const { data } = await getProduct(id)
      setEditing(data)
    } catch {
      setMessage({ type: 'error', text: 'No se pudo cargar el producto.' })
    }
  }

  const handleSave = async (payload) => {
    try {
      if (editing && editing.id) {
        await updateProduct(editing.id, payload)
        setMessage({ type: 'success', text: 'Producto actualizado correctamente.' })
      } else {
        await createProduct(payload)
        setMessage({ type: 'success', text: 'Producto registrado correctamente.' })
      }
      setEditing(null)
      await loadProducts()
    } catch {
      setMessage({ type: 'error', text: 'No se pudo guardar el producto.' })
    }
  }

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`¿Eliminar "${product.name}"? Esta accion no se puede deshacer.`)
    if (!confirmed) return

    try {
      await deleteProduct(product.id)
      setMessage({ type: 'success', text: 'Producto eliminado correctamente.' })
      await loadProducts()
    } catch {
      setMessage({ type: 'error', text: 'No se pudo eliminar el producto.' })
    }
  }

  const isFormVisible = editing !== null
  const isEditingExisting = Boolean(editing && editing.id)

  return (
    <section className="products-page">
      <div className="page-header">
        <div>
          <h2>Productos</h2>
          <p className="muted">Administra el nombre, precio y cantidad disponible.</p>
        </div>
        {!isFormVisible && (
          <button type="button" className="btn btn-primary" onClick={() => setEditing('new')}>
            Nuevo producto
          </button>
        )}
      </div>

      {message.text && (
        <p className={message.type === 'error' ? 'alert alert-error' : 'alert alert-success'} role="status">
          {message.text}
        </p>
      )}

      {isFormVisible && (
        <ProductForm
          initialValues={isEditingExisting ? editing : null}
          submitLabel={isEditingExisting ? 'Guardar cambios' : 'Registrar producto'}
          onSubmit={handleSave}
          onCancel={() => setEditing(null)}
        />
      )}

      <div className="card table-card">
        {loading ? (
          <p className="muted">Cargando productos...</p>
        ) : products.length === 0 ? (
          <p className="muted">Todavia no hay productos registrados.</p>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Descripcion</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td data-label="Nombre">{product.name}</td>
                    <td data-label="Descripcion">{product.description || '-'}</td>
                    <td data-label="Precio">{Number(product.price).toFixed(2)}</td>
                    <td data-label="Cantidad">{product.quantity}</td>
                    <td data-label="Acciones" className="actions">
                      <button type="button" className="btn btn-small" onClick={() => handleEdit(product.id)}>
                        Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-small btn-danger"
                        onClick={() => handleDelete(product)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
