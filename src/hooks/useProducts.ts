import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { apiService } from '../services/api'
import type {
  Product,
  CreateProductData,
  UpdateProductData,
  ProductFilters,
} from '../types'

// Types for API responses
interface ProductsResponse {
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductFilters, page: number, limit: number) =>
    [...productKeys.lists(), { filters, page, limit }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

// Fetch Products Hook
export const useProducts = (
  filters: ProductFilters = {},
  page: number = 1,
  limit: number = 10
) => {
  return useQuery({
    queryKey: productKeys.list(filters, page, limit),
    queryFn: async () => {
      const response = await apiService.getProducts({
        page,
        limit,
        search: filters.search,
        category: filters.category,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch products')
      }

      return response.data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

// Fetch Single Product Hook
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: async () => {
      const response = await apiService.getProduct(id)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to fetch product')
      }

      return response.data
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

// Create Product Hook
export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (productData: CreateProductData) => {
      const response = await apiService.createProduct(productData)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create product')
      }

      return response.data
    },
    onSuccess: newProduct => {
      // Invalidate and refetch products list
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })

      // Optionally add the new product to existing queries (optimistic update)
      queryClient.setQueriesData(
        { queryKey: productKeys.lists() },
        (oldData: ProductsResponse | undefined) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            data: [newProduct, ...oldData.data],
            pagination: {
              ...oldData.pagination,
              total: oldData.pagination.total + 1,
            },
          }
        }
      )

      toast.success('Product created successfully! 🎉')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product')
    },
  })
}

// Update Product Hook
export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: UpdateProductData
    }) => {
      const response = await apiService.updateProduct(id, data)

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to update product')
      }

      return response.data
    },
    onSuccess: updatedProduct => {
      // Update the specific product in cache
      queryClient.setQueryData(
        productKeys.detail(updatedProduct._id),
        updatedProduct
      )

      // Update the product in all list queries
      queryClient.setQueriesData(
        { queryKey: productKeys.lists() },
        (oldData: ProductsResponse | undefined) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            data: oldData.data.map((product: Product) =>
              product._id === updatedProduct._id ? updatedProduct : product
            ),
          }
        }
      )

      toast.success('Product updated successfully! ✏️')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product')
    },
  })
}

// Delete Product Hook
export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiService.deleteProduct(id)

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete product')
      }

      return id
    },
    onSuccess: deletedId => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: productKeys.detail(deletedId) })

      // Remove from all list queries
      queryClient.setQueriesData(
        { queryKey: productKeys.lists() },
        (oldData: ProductsResponse | undefined) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            data: oldData.data.filter(
              (product: Product) => product._id !== deletedId
            ),
            pagination: {
              ...oldData.pagination,
              total: Math.max(0, oldData.pagination.total - 1),
            },
          }
        }
      )

      toast.success('Product deleted successfully! 🗑️')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product')
    },
  })
}
