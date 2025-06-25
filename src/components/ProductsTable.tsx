import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  createColumnHelper,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Edit,
  Eye,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react'
import type { Product } from '../types'

interface ProductsTableProps {
  data: Product[]
  isLoading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  onPageChange: (page: number) => void
  onSearch: (query: string) => void
  onEdit: (product: Product) => void
  onDelete: (product: Product) => void
  onCreateNew: () => void
  searchQuery: string
}

const columnHelper = createColumnHelper<Product>()

const ProductsTable = ({
  data,
  isLoading,
  pagination,
  onPageChange,
  onSearch,
  onEdit,
  onDelete,
  onCreateNew,
  searchQuery,
}: ProductsTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // Use refs to prevent focus loss and manage debouncing
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [localSearchValue, setLocalSearchValue] = useState(searchQuery)

  const navigate = useNavigate()

  // Sync local search value with prop when it changes externally
  useEffect(() => {
    setLocalSearchValue(searchQuery)
  }, [searchQuery])

  // Memoize utility functions
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

  // Improved search handling with stable debouncing
  const handleSearchChange = useCallback(
    (value: string) => {
      setLocalSearchValue(value)

      // Clear existing timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }

      // Set new timeout
      debounceTimeoutRef.current = setTimeout(() => {
        onSearch(value)
      }, 300)
    },
    [onSearch]
  )

  const clearSearch = useCallback(() => {
    setLocalSearchValue('')
    onSearch('')
    // Maintain focus after clearing
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 0)
  }, [onSearch])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [])

  // Define columns - memoized to prevent unnecessary re-renders
  const columns = useMemo(
    () => [
      // Selection column
      columnHelper.display({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            disabled={isLoading}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="rounded border-gray-300"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            disabled={isLoading}
          />
        ),
        enableSorting: false,
        enableHiding: false,
      }),

      // Product column (image + name + SKU)
      columnHelper.accessor('name', {
        id: 'product',
        header: 'Product',
        cell: ({ row }) => {
          const product = row.original
          return (
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
                <div className="font-medium text-gray-900">{product.name}</div>
                <div className="text-sm text-gray-500">SKU: {product.sku}</div>
              </div>
            </div>
          )
        },
        enableSorting: true,
        enableColumnFilter: true,
      }),

      // Category column
      columnHelper.accessor('category', {
        header: 'Category',
        cell: ({ getValue }) => {
          const category = getValue()
          return (
            <span
              className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(category)}`}
            >
              {category}
            </span>
          )
        },
        enableSorting: true,
        enableColumnFilter: true,
      }),

      // Stock column
      columnHelper.accessor('quantity', {
        id: 'stock',
        header: 'Stock',
        cell: ({ row }) => {
          const product = row.original
          const stockStatus = getStockStatus(
            product.quantity,
            product.minStockLevel
          )
          return (
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full ${stockStatus.color} mr-2`}
              ></div>
              <span className="font-medium">{product.quantity}</span>
            </div>
          )
        },
        enableSorting: true,
      }),

      // Price column
      columnHelper.accessor('price', {
        header: 'Price',
        cell: ({ getValue }) => (
          <div className="font-medium text-gray-900">
            ${getValue().toFixed(2)}
          </div>
        ),
        enableSorting: true,
      }),

      // Last Update column
      columnHelper.accessor('updatedAt', {
        id: 'lastUpdate',
        header: 'Last Update',
        cell: ({ getValue }) => (
          <span className="text-sm text-gray-500">
            {formatDate(getValue())}
          </span>
        ),
        enableSorting: true,
      }),

      // Actions column
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const product = row.original
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(product)}
                disabled={isLoading}
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/products/${product._id}`)}
                disabled={isLoading}
              >
                <Eye className="h-3 w-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                onClick={() => onDelete(product)}
                disabled={isLoading}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )
        },
        enableSorting: false,
        enableHiding: false,
      }),
    ] as ColumnDef<Product>[],
    [
      isLoading,
      getCategoryColor,
      getStockStatus,
      formatDate,
      onEdit,
      onDelete,
      navigate,
    ]
  )

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // We handle pagination externally
    pageCount: pagination.pages,
  })

  const selectedRows = table.getFilteredSelectedRowModel().rows
  const hasSelection = selectedRows.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {searchQuery ? 'Search Results' : 'All Products'}
          </h1>
          <p className="text-gray-600">
            {searchQuery ? (
              <>
                {pagination.total} results for "{searchQuery}" • {data.length}{' '}
                shown
                {pagination.total === 0 && !isLoading && (
                  <button
                    onClick={clearSearch}
                    className="ml-2 text-blue-600 hover:text-blue-800 underline"
                  >
                    Clear search
                  </button>
                )}
              </>
            ) : (
              <>
                {pagination.total} total products • {data.length} shown
              </>
            )}
          </p>
          {hasSelection && (
            <p className="text-sm text-blue-600 mt-1">
              {selectedRows.length} product
              {selectedRows.length === 1 ? '' : 's'} selected
            </p>
          )}
        </div>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search products by name, SKU, or description..."
              className="pl-10 pr-10"
              value={localSearchValue}
              onChange={e => handleSearchChange(e.target.value)}
              disabled={isLoading}
            />
            {localSearchValue && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {hasSelection && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700"
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedRows.length})
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add product
          </Button>

          <Button variant="outline" disabled={isLoading}>
            <Filter className="h-4 w-4 mr-2" />
            Filter options
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Show subtle loading indicator */}
        {isLoading && (
          <div className="absolute inset-x-0 top-0 h-1 bg-blue-200 z-10">
            <div className="h-full bg-blue-600 animate-pulse"></div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort()
                              ? 'cursor-pointer select-none hover:text-gray-700'
                              : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {header.column.getIsSorted() === 'desc' ? (
                                <ArrowDown className="h-3 w-3" />
                              ) : header.column.getIsSorted() === 'asc' ? (
                                <ArrowUp className="h-3 w-3" />
                              ) : (
                                <ArrowUpDown className="h-3 w-3" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody
              className={`divide-y divide-gray-200 ${isLoading ? 'opacity-60' : ''}`}
            >
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center"
                  >
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
                          <Button variant="outline" onClick={clearSearch}>
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
                table.getRowModel().rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && data.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1}-
              {Math.min(pagination.page * pagination.limit, pagination.total)}{' '}
              of {pagination.total}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={pagination.page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = i + 1
                return (
                  <Button
                    key={page}
                    variant={pagination.page === page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    disabled={isLoading}
                  >
                    {page}
                  </Button>
                )
              })}

              {pagination.pages > 5 && (
                <>
                  <span className="text-gray-500">...</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(pagination.pages)}
                    disabled={isLoading}
                  >
                    {pagination.pages}
                  </Button>
                </>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages || isLoading}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductsTable
