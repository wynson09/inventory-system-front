// User Types
export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  role: 'USER' | 'MANAGER' | 'ADMIN'
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  role?: 'USER' | 'MANAGER' | 'ADMIN'
}

// Product Types
export interface Product {
  _id: string
  name: string
  description?: string
  sku: string
  category: string
  price: number
  quantity: number
  minStockLevel: number
  images: string[]
  isActive: boolean
  userId: string
  createdAt: string
  updatedAt: string
  // Virtual fields
  isLowStock?: boolean
  stockStatus?: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'IN_STOCK'
}

export interface CreateProductData {
  name: string
  description?: string
  sku: string
  category: string
  price: number
  quantity: number
  minStockLevel: number
  images?: string[]
}

export interface UpdateProductData extends Partial<CreateProductData> {
  isActive?: boolean
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  success: boolean
  message: string
  data: {
    data: T[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }
}

// Auth Context Types
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
}

// Product Store Types
export interface ProductState {
  products: Product[]
  currentProduct: Product | null
  isLoading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Search and Filter Types
export interface ProductFilters {
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
}
