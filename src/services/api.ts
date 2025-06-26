import axios from 'axios'
import type { AxiosInstance, AxiosResponse } from 'axios'
import type {
  ApiResponse,
  PaginatedResponse,
  User,
  Product,
  LoginCredentials,
  RegisterData,
  CreateProductData,
  UpdateProductData,
} from '../types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      config => {
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => Promise.reject(error)
    )

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(
    credentials: LoginCredentials
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> =
      await this.api.post('/auth/login', credentials)
    return response.data
  }

  async register(
    userData: RegisterData
  ): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> =
      await this.api.post('/auth/register', userData)
    return response.data
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> =
      await this.api.get('/auth/me')
    return response.data
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response: AxiosResponse<ApiResponse<User>> = await this.api.put(
      '/auth/profile',
      userData
    )
    return response.data
  }

  // Product endpoints
  async getProducts(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    inStock?: boolean
  }): Promise<PaginatedResponse<Product>> {
    const response: AxiosResponse<PaginatedResponse<Product>> =
      await this.api.get('/products', { params })
    return response.data
  }

  async getCategories(): Promise<ApiResponse<string[]>> {
    const response: AxiosResponse<ApiResponse<string[]>> = await this.api.get('/products/categories')
    return response.data
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.get(
      `/products/${id}`
    )
    return response.data
  }

  async createProduct(
    productData: CreateProductData
  ): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.post(
      '/products',
      productData
    )
    return response.data
  }

  async updateProduct(
    id: string,
    productData: UpdateProductData
  ): Promise<ApiResponse<Product>> {
    const response: AxiosResponse<ApiResponse<Product>> = await this.api.put(
      `/products/${id}`,
      productData
    )
    return response.data
  }

  async deleteProduct(id: string): Promise<ApiResponse<void>> {
    const response: AxiosResponse<ApiResponse<void>> = await this.api.delete(
      `/products/${id}`
    )
    return response.data
  }

  async searchProducts(query: string): Promise<PaginatedResponse<Product>> {
    const response: AxiosResponse<PaginatedResponse<Product>> =
      await this.api.get(`/products/search?q=${encodeURIComponent(query)}`)
    return response.data
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.get('/health')
    return response.data
  }
}

export const apiService = new ApiService()
export default apiService
