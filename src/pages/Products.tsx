import { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useProducts, useDeleteProduct } from '../hooks/useProducts'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import CreateProductModal from '../components/CreateProductModal'
import EditProductModal from '../components/EditProductModal'
import DeleteConfirmationModal from '../components/DeleteConfirmationModal'
import FilterDropdown from '../components/FilterDropdown'
import {
  Search,
  Plus,
  Edit,
  Eye,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import type { Product, ProductFilters } from '../types'

// Memoized SearchInput component to prevent re-renders
const SearchInput = memo(
  ({
    onSearchChange,
    onClearSearch,
    searchInputRef,
    localSearchValue,
  }: {
    onSearchChange: (value: string) => void
    onClearSearch: () => void
    searchInputRef: React.RefObject<HTMLInputElement | null>
    localSearchValue: string
  }) => {
    const handleSubmit = useCallback((e: React.FormEvent) => {
      e.preventDefault()
    }, [])

    return (
      <form onSubmit={handleSubmit} className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search products by name, SKU, or description..."
            className="pl-10 pr-10"
            value={localSearchValue}
            onChange={e => onSearchChange(e.target.value)}
          />
          {localSearchValue && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
    )
  }
)

SearchInput.displayName = 'SearchInput'

// Memoized Header component to prevent re-renders
const ProductsHeader = memo(
  ({
    searchQuery,
    totalProducts,
    shownProducts,
    onClearSearch,
    hasResults,
  }: {
    searchQuery: string
    totalProducts: number
    shownProducts: number
    onClearSearch: () => void
    hasResults: boolean
  }) => {
    return (
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery ? 'Search Results' : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {searchQuery ? (
              <>
                {totalProducts} results for "{searchQuery}" • {shownProducts}{' '}
                shown
                {totalProducts === 0 && hasResults && (
                  <button
                    onClick={onClearSearch}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear search
                  </button>
                )}
              </>
            ) : (
              <>
                {totalProducts} total products • {shownProducts} shown
              </>
            )}
          </p>
        </div>
      </div>
    )
  }
)

ProductsHeader.displayName = 'ProductsHeader'

// Memoized ProductsTable component to isolate re-renders
const ProductsTable = memo(
  ({
    products,
    isLoading,
    searchQuery,
    onEdit,
    onDelete,
    onPreview,
    onCreateNew,
    onClearSearch,
    getStockStatus,
    getCategoryColor,
    formatDate,
  }: {
    products: Product[]
    isLoading: boolean
    searchQuery: string
    onEdit: (product: Product) => void
    onDelete: (product: Product) => void
    onPreview: (productId: string) => void
    onCreateNew: () => void
    onClearSearch: () => void
    getStockStatus: (
      quantity: number,
      minStockLevel: number
    ) => { color: string; status: string }
    getCategoryColor: (category: string) => string
    formatDate: (dateString: string) => string
  }) => {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden relative">
        {/* Subtle loading indicator */}
        {isLoading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-200 z-10">
            <div className="h-full bg-blue-600 animate-pulse"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-600 border-b border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-400 bg-gray-700"
                    disabled={isLoading}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Last Update
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-gray-200 ${isLoading ? 'opacity-60' : ''}`}
            >
              {!products || products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    {searchQuery ? (
                      <>
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No products found
                        </h3>
                        <p className="text-gray-500 mb-4">
                          No products match your search for "{searchQuery}". Try
                          a different search term.
                        </p>
                        <div className="space-x-2">
                          <Button variant="outline" onClick={onClearSearch}>
                            Clear search
                          </Button>
                          <Button onClick={onCreateNew}>
                            <Plus className="h-4 w-4 mr-2" />
                            Add product
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          No products yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                          Get started by creating your first product.
                        </p>
                        <Button onClick={onCreateNew}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add your first product
                        </Button>
                      </>
                    )}
                  </td>
                </tr>
              ) : (
                products.map((product: Product) => {
                  const stockStatus = getStockStatus(
                    product.quantity,
                    product.minStockLevel
                  )
                  return (
                    <tr key={product._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center mr-3">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              SKU: {product.sku}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(product.category)}`}
                        >
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`w-2 h-2 rounded-full ${stockStatus.color} mr-2`}
                          ></div>
                          <span className="font-medium">
                            {product.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(product)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onPreview(product._id)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Preview
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => onDelete(product)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
)

ProductsTable.displayName = 'ProductsTable'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // Search state management with refs to prevent focus loss
  const [localSearchValue, setLocalSearchValue] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const itemsPerPage = 10

    // Initialize filters from URL params on component mount
  useEffect(() => {
    const searchFromUrl = searchParams.get('search') || ''
    const categoryFromUrl = searchParams.get('category') || ''
    const minPriceFromUrl = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined
    const maxPriceFromUrl = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined
    const inStockFromUrl = searchParams.get('inStock') === 'true' ? true : undefined
    const pageFromUrl = parseInt(searchParams.get('page') || '1', 10)
    
    setLocalSearchValue(searchFromUrl)
    setFilters({
      search: searchFromUrl || undefined,
      category: categoryFromUrl || undefined,
      minPrice: minPriceFromUrl,
      maxPrice: maxPriceFromUrl,
      inStock: inStockFromUrl,
    })
    setCurrentPage(pageFromUrl)
  }, []) // Only run on mount

  // Use TanStack Query hooks
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useProducts(filters, currentPage, itemsPerPage)

  const deleteProductMutation = useDeleteProduct()

  // Extract data from the response
  const products = productsData?.data || []
  const pagination = productsData?.pagination || {
    page: currentPage,
    limit: itemsPerPage,
    total: 0,
    pages: 0,
  }

  const navigate = useNavigate()

  // Update URL when filters or page changes
  const updateUrlParams = useCallback(
    (filters: ProductFilters, page: number) => {
      const newParams = new URLSearchParams()

      if (filters.search) {
        newParams.set('search', filters.search)
      }
      if (filters.category) {
        newParams.set('category', filters.category)
      }
      if (filters.minPrice !== undefined) {
        newParams.set('minPrice', filters.minPrice.toString())
      }
      if (filters.maxPrice !== undefined) {
        newParams.set('maxPrice', filters.maxPrice.toString())
      }
      if (filters.inStock) {
        newParams.set('inStock', 'true')
      }
      if (page > 1) {
        newParams.set('page', page.toString())
      }

      setSearchParams(newParams)
    },
    [setSearchParams]
  )

  // Improved search handling with URL sync
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearchValue(value)

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        const newFilters = { ...filters, search: value }
        setFilters(newFilters)
        setCurrentPage(1) // Reset to first page when searching
        updateUrlParams(newFilters, 1) // Update URL
      }, 300)
    },
    [updateUrlParams]
  )

  const clearSearch = useCallback(() => {
    setLocalSearchValue('')
    const newFilters = { ...filters, search: undefined }
    setFilters(newFilters)
    setCurrentPage(1)
    updateUrlParams(newFilters, 1) // Clear URL params
    // Maintain focus after clearing
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)
  }, [updateUrlParams, filters])

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: ProductFilters) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page when filtering
    updateUrlParams(newFilters, 1)
  }, [updateUrlParams])

  // Update URL when page changes
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      updateUrlParams(filters, page)
    },
    [filters, updateUrlParams]
  )

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Memoize event handlers to prevent unnecessary re-renders
  const handleEdit = useCallback((product: Product) => {
    setSelectedProduct(product)
    setIsEditModalOpen(true)
  }, [])

  const handlePreview = useCallback(
    (productId: string) => {
      navigate(`/products/${productId}`)
    },
    [navigate]
  )

  const handleDeleteClick = useCallback((product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!productToDelete) return

    try {
      await deleteProductMutation.mutateAsync(productToDelete._id)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      // Refetch if we're on a page that might now be empty
      if (products.length === 1 && currentPage > 1) {
        const newPage = currentPage - 1
        setCurrentPage(newPage)
        updateUrlParams(filters, newPage)
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }, [
    productToDelete,
    deleteProductMutation,
    products.length,
    currentPage,
    filters.search,
    updateUrlParams,
  ])

  const handleDeleteCancel = useCallback(() => {
    setIsDeleteModalOpen(false)
    setProductToDelete(null)
  }, [])

  // Memoize expensive calculations and utility functions
  const getStockStatus = useCallback(
    (quantity: number, minStockLevel: number) => {
      if (quantity === 0) {
        return { color: 'bg-red-500', status: 'Out of Stock' }
      } else if (quantity <= minStockLevel) {
        return { color: 'bg-yellow-500', status: 'Low Stock' }
      } else {
        return { color: 'bg-green-500', status: 'In Stock' }
      }
    },
    []
  )

  // Memoize category colors object to prevent recreation on every render
  const categoryColors = useMemo(
    (): Record<string, string> => ({
      Electronics: 'bg-blue-100 text-blue-800',
      Clothing: 'bg-purple-100 text-purple-800',
      'Food & Beverage': 'bg-green-100 text-green-800',
      Books: 'bg-yellow-100 text-yellow-800',
      'Home & Garden': 'bg-pink-100 text-pink-800',
      'Sports & Outdoors': 'bg-indigo-100 text-indigo-800',
      'Toys & Games': 'bg-red-100 text-red-800',
      'Health & Beauty': 'bg-teal-100 text-teal-800',
      Automotive: 'bg-gray-100 text-gray-800',
      'Office Supplies': 'bg-orange-100 text-orange-800',
    }),
    []
  )

  const getCategoryColor = useCallback(
    (category: string) => {
      return categoryColors[category] || 'bg-gray-100 text-gray-800'
    },
    [categoryColors]
  )

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }, [])

  // Memoize computed values
  const totalPages = useMemo(() => {
    return Math.ceil((pagination?.total || 0) / itemsPerPage)
  }, [pagination?.total, itemsPerPage])

  // Memoize pagination handlers with URL updates
  const handlePreviousPage = useCallback(() => {
    const newPage = Math.max(1, currentPage - 1)
    handlePageChange(newPage)
  }, [currentPage, handlePageChange])

  const handleNextPage = useCallback(() => {
    const newPage = Math.min(totalPages, currentPage + 1)
    handlePageChange(newPage)
  }, [currentPage, totalPages, handlePageChange])

  const handleGoToPage = useCallback(
    (page: number) => {
      handlePageChange(page)
    },
    [handlePageChange]
  )

  const handleGoToLastPage = useCallback(() => {
    handlePageChange(totalPages)
  }, [totalPages, handlePageChange])

  // Error handling
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading products</div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header - Memoized */}
      <ProductsHeader
        searchQuery={filters.search || ''}
        totalProducts={pagination?.total || 0}
        shownProducts={products?.length || 0}
        onClearSearch={clearSearch}
        hasResults={!isLoading}
      />

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <SearchInput
          onSearchChange={handleSearchChange}
          onClearSearch={clearSearch}
          searchInputRef={searchInputRef}
          localSearchValue={localSearchValue}
        />

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add product
          </Button>

          <FilterDropdown
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Products Table - Memoized */}
      <ProductsTable
        products={products}
        isLoading={isLoading}
        searchQuery={filters.search || ''}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onPreview={handlePreview}
        onCreateNew={() => setIsCreateModalOpen(true)}
        onClearSearch={clearSearch}
        getStockStatus={getStockStatus}
        getCategoryColor={getCategoryColor}
        formatDate={formatDate}
      />

      {/* Pagination */}
      {products && products.length > 0 && !isLoading && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-white rounded-lg shadow">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, pagination?.total || 0)} of{' '}
            {pagination?.total || 0}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleGoToPage(page)}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              )
            })}

            {totalPages > 5 && (
              <>
                <span className="text-gray-500">...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGoToLastPage}
                  disabled={isLoading}
                >
                  {totalPages}
                </Button>
              </>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create Product Modal */}
      <CreateProductModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          // TanStack Query will automatically update the cache
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedProduct(null)
        }}
        onSuccess={() => {
          setIsEditModalOpen(false)
          setSelectedProduct(null)
          // TanStack Query will automatically update the cache
        }}
        product={selectedProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
        isDeleting={deleteProductMutation.isPending}
      />
    </div>
  )
}

export default Products
