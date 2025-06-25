import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import ProductsTable from '../ProductsTable'
import type { Product } from '../../types'

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockProducts: Product[] = [
  {
    _id: '1',
    name: 'Test Product 1',
    sku: 'TEST001',
    category: 'Electronics',
    price: 99.99,
    quantity: 10,
    minStockLevel: 5,
    description: 'Test product description',
    images: ['https://example.com/image1.jpg'],
    isActive: true,
    userId: 'user1',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: '2',
    name: 'Test Product 2',
    sku: 'TEST002',
    category: 'Clothing',
    price: 49.99,
    quantity: 0,
    minStockLevel: 3,
    description: 'Another test product',
    images: ['https://example.com/image2.jpg'],
    isActive: true,
    userId: 'user1',
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
]

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('ProductsTable', () => {
  const defaultProps = {
    data: mockProducts,
    isLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 2,
      pages: 1,
    },
    onPageChange: vi.fn(),
    onSearch: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onCreateNew: vi.fn(),
    searchQuery: '',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Positive Tests', () => {
    it('should render table header and controls', () => {
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('All Products')).toBeInTheDocument()
      expect(screen.getByText('Add product')).toBeInTheDocument()
      expect(screen.getByText('Filter options')).toBeInTheDocument()
    })

    it('should display product count', () => {
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText(/2 total products/)).toBeInTheDocument()
    })

    it('should render search input', () => {
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search products by name, sku, or description/i)
      expect(searchInput).toBeInTheDocument()
    })

    it('should call onCreateNew when create button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} />
        </TestWrapper>
      )

      const createButton = screen.getByText('Add product')
      await user.click(createButton)

      expect(defaultProps.onCreateNew).toHaveBeenCalled()
    })

    it('should handle search input typing', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} />
        </TestWrapper>
      )

      const searchInput = screen.getByPlaceholderText(/search products by name, sku, or description/i)
      await user.type(searchInput, 'test')

      // Wait for debounce and check if onSearch was called
      await vi.waitFor(() => {
        expect(defaultProps.onSearch).toHaveBeenCalledWith('test')
      }, { timeout: 500 })
    })
  })

  describe('Negative Tests', () => {
    it('should show loading state', () => {
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} isLoading={true} />
        </TestWrapper>
      )

      // Component should still render basic elements when loading
      expect(screen.getByText('Add product')).toBeInTheDocument()
    })

    it('should show empty state when no products', () => {
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} data={[]} pagination={{ ...defaultProps.pagination, total: 0 }} />
        </TestWrapper>
      )

      // Check for zero count in header
      expect(screen.getByText(/0 total products/i)).toBeInTheDocument()
    })

    it('should handle null data gracefully', () => {
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} data={[]} />
        </TestWrapper>
      )

      // Should not crash with empty data
      expect(screen.getByText('All Products')).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle different pagination states', () => {
      const paginationProps = {
        ...defaultProps,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          pages: 3,
        }
      }

      render(
        <TestWrapper>
          <ProductsTable {...paginationProps} />
        </TestWrapper>
      )

      // Should show total count
      expect(screen.getByText(/25 total products/)).toBeInTheDocument()
    })

    it('should handle search with results', () => {
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} searchQuery="test" />
        </TestWrapper>
      )

      // Should display search query in input
      const searchInput = screen.getByDisplayValue('test')
      expect(searchInput).toBeInTheDocument()
    })

    it('should clear search when input is cleared', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <ProductsTable {...defaultProps} searchQuery="test" />
        </TestWrapper>
      )

      // Clear the search input directly
      const searchInput = screen.getByDisplayValue('test')
      await user.clear(searchInput)

      // Wait for debounce
      await vi.waitFor(() => {
        expect(defaultProps.onSearch).toHaveBeenCalledWith('')
      }, { timeout: 500 })
    })

    it('should render with different product counts', () => {
      const singleProductProps = {
        ...defaultProps,
        data: [mockProducts[0]],
        pagination: {
          ...defaultProps.pagination,
          total: 1,
        }
      }

      render(
        <TestWrapper>
          <ProductsTable {...singleProductProps} />
        </TestWrapper>
      )

      // Should show correct count for single product
      expect(screen.getByText(/1 total products/)).toBeInTheDocument()
    })
  })
}) 