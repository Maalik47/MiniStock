import { useEffect, useState } from 'react'

const emptyForm = { name: '', description: '', price: '', quantity: '' }

export default function ProductForm({ initialValues, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    setForm(
      initialValues
        ? {
            name: initialValues.name ?? '',
            description: initialValues.description ?? '',
            price: String(initialValues.price ?? ''),
            quantity: String(initialValues.quantity ?? ''),
          }
        : emptyForm,
    )
    setError('')
  }, [initialValues])

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const price = Number(form.price)
    const quantity = Number(form.quantity)

    if (!form.name.trim() || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      setError('Revisa los campos: nombre obligatorio, precio >= 0 y cantidad entera >= 0.')
      return
    }

    setError('')
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price,
      quantity,
    })
  }

  return (
    <form className="card product-form" onSubmit={handleSubmit}>
      <h3>{submitLabel}</h3>

      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="name">Nombre</label>
          <input id="name" name="name" value={form.name} onChange={handleChange} required />
        </div>
        <div className="form-field">
          <label htmlFor="price">Precio</label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="quantity">Cantidad disponible</label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            step="1"
            min="0"
            value={form.quantity}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="description">Descripcion</label>
          <input
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
          />
        </div>
      </div>

      {error && <p className="alert alert-error" role="alert">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">{submitLabel}</button>
        <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  )
}
