import { useState, useEffect, useCallback, useRef } from 'react'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import type { ProductFilters } from '../types'

interface FilterDropdownProps {
  filters: ProductFilters
  onFiltersChange: (filters: ProductFilters) => void
  categories?: string[] // Made optional since we'll use hardcoded list
  isLoading?: boolean
}

const FilterDropdown = ({
  filters,
  onFiltersChange,
  isLoading = false
}: FilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true)
  const [isPriceExpanded, setIsPriceExpanded] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Same categories as CreateProductModal for consistency
  const categories = [
    'Electronics',
    'Clothing',
    'Food & Beverage',
    'Books',
    'Home & Garden',
    'Sports & Outdoors',
    'Toys & Games',
    'Health & Beauty',
    'Automotive',
    'Office Supplies',
    'Other',
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update local filters when props change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleCategoryChange = useCallback((category: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      category: checked ? category : undefined
    }))
  }, [])

  const handlePriceChange = useCallback((field: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value === '' ? undefined : parseFloat(value)
    setLocalFilters(prev => ({
      ...prev,
      [field]: numValue
    }))
  }, [])

  const handleInStockChange = useCallback((checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      inStock: checked ? true : undefined
    }))
  }, [])

  const applyFilters = useCallback(() => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }, [localFilters, onFiltersChange])

  const clearFilters = useCallback(() => {
    const clearedFilters = { search: filters.search } // Keep search
    setLocalFilters(clearedFilters)
    onFiltersChange(clearedFilters)
  }, [filters.search, onFiltersChange])

  const hasActiveFilters = Boolean(
    filters.category || 
    filters.minPrice !== undefined || 
    filters.maxPrice !== undefined || 
    filters.inStock
  )

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) count++
    if (filters.inStock) count++
    return count
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`relative ${hasActiveFilters ? 'border-blue-500 bg-blue-50' : ''}`}
      >
        <Filter className="h-4 w-4 mr-2" />
        Filter options
        {hasActiveFilters && (
          <span className="ml-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {getActiveFilterCount()}
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="h-4 w-4 ml-1" />
        ) : (
          <ChevronDown className="h-4 w-4 ml-1" />
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filters Content */}
          <div className="p-4 space-y-6 max-h-96 overflow-y-auto">
            {/* Category Filter */}
            <div>
              <button
                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-3 hover:text-gray-700"
              >
                Category
                {isCategoryExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              {isCategoryExpanded && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {categories.map(category => (
                    <label
                      key={category}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.category === category}
                        onChange={(e) => handleCategoryChange(category, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Filter */}
            <div>
              <button
                onClick={() => setIsPriceExpanded(!isPriceExpanded)}
                className="w-full flex items-center justify-between text-sm font-medium text-gray-900 mb-3 hover:text-gray-700"
              >
                Price
                {isPriceExpanded ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </button>
              
              {isPriceExpanded && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">From</label>
                      <Input
                        type="number"
                        placeholder="Min"
                        value={localFilters.minPrice || ''}
                        onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                        className="text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">To</label>
                      <Input
                        type="number"
                        placeholder="Max"
                        value={localFilters.maxPrice || ''}
                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                        className="text-sm"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Stock Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Availability</h4>
              <label className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                <input
                  type="checkbox"
                  checked={localFilters.inStock || false}
                  onChange={(e) => handleInStockChange(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">In stock only</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={applyFilters}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Apply filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterDropdown 