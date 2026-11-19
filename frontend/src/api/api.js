import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ministock_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ministock_token')
      localStorage.removeItem('ministock_email')
      window.dispatchEvent(new Event('ministock:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export const login = (credentials) => api.post('/auth/login', credentials)
export const getProducts = () => api.get('/products')
export const getProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (product) => api.post('/products', product)
export const updateProduct = (id, product) => api.put(`/products/${id}`, product)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

export default api
