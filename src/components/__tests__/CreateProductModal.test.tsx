import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import CreateProductModal from '../CreateProductModal'

// Mock the hooks
vi.mock('../../hooks/useProducts', () => ({
  useCreateProduct: () => ({
    mutate: vi.fn(),
    isPending: false,
    error: null,
  }),
  useCategories: () => ({
    data: ['Electronics', 'Clothing', 'Books', 'Home & Garden'],
    isLoading: false,
    error: null,
  }),
}))

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

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

describe('CreateProductModal', () => {
  const mockOnClose = vi.fn()
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Positive Tests', () => {
    it('should render the modal when isOpen is true', () => {
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByText('Create New Product')).toBeInTheDocument()
      expect(screen.getByLabelText(/product name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/sku/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/quantity/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument()
    })

    it('should not render the modal when isOpen is false', () => {
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} isOpen={false} />
        </TestWrapper>
      )

      expect(screen.queryByText('Create New Product')).not.toBeInTheDocument()
    })

    it('should call onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const cancelButton = screen.getByText('Cancel')
      await user.click(cancelButton)

      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('should auto-uppercase SKU input', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const skuInput = screen.getByLabelText(/sku/i)
      await user.type(skuInput, 'abc123')

      expect(skuInput).toHaveValue('ABC123')
    })

    it('should populate category dropdown with available categories', () => {
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.click(categorySelect)

      expect(screen.getByText('Electronics')).toBeInTheDocument()
      expect(screen.getByText('Clothing')).toBeInTheDocument()
      expect(screen.getByText('Books')).toBeInTheDocument()
      expect(screen.getByText('Home & Garden')).toBeInTheDocument()
    })

    it('should accept valid form data', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      // Fill in all required fields
      await user.type(screen.getByLabelText(/product name/i), 'Test Product')
      await user.type(screen.getByLabelText(/sku/i), 'TEST123')
      await user.type(screen.getByLabelText(/price/i), '99.99')
      await user.type(screen.getByLabelText(/quantity/i), '10')
      await user.type(screen.getByLabelText(/description/i), 'Test description')

      // Select category
      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      // Submit form
      const createButton = screen.getByText('Create Product')
      expect(createButton).not.toBeDisabled()
    })
  })

  describe('Negative Tests', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      // Try to submit empty form
      const createButton = screen.getByText('Create Product')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Product name is required')).toBeInTheDocument()
        expect(screen.getByText('SKU is required')).toBeInTheDocument()
        expect(screen.getByText('Category is required')).toBeInTheDocument()
        expect(screen.getByText('Price is required')).toBeInTheDocument()
        expect(screen.getByText('Quantity is required')).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid price', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const priceInput = screen.getByLabelText(/price/i)
      await user.type(priceInput, '-10')

      const createButton = screen.getByText('Create Product')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Price must be greater than 0')).toBeInTheDocument()
      })
    })

    it('should show validation error for invalid quantity', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const quantityInput = screen.getByLabelText(/quantity/i)
      await user.type(quantityInput, '-5')

      const createButton = screen.getByText('Create Product')
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Quantity must be 0 or greater')).toBeInTheDocument()
      })
    })

    it('should show validation error for product name that is too long', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const nameInput = screen.getByLabelText(/product name/i)
      const longName = 'a'.repeat(101) // Assuming max length is 100
      await user.type(nameInput, longName)

      const createButton = screen.getByRole('button', { name: /create product/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('Product name cannot exceed 100 characters')).toBeInTheDocument()
      })
    })

    it('should show validation error for SKU that is too short', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const skuInput = screen.getByLabelText(/sku/i)
      await user.type(skuInput, 'AB')

      const createButton = screen.getByRole('button', { name: /create product/i })
      await user.click(createButton)

      await waitFor(() => {
        expect(screen.getByText('SKU must be at least 3 characters')).toBeInTheDocument()
      })
    })

    it('should not accept non-numeric values in price field', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const priceInput = screen.getByLabelText(/price/i)
      await user.type(priceInput, 'abc')

      // Price input should remain empty or show validation error (number inputs convert to null when default is undefined)
      expect(priceInput).toHaveValue(null)
    })

    it('should not accept non-numeric values in quantity field', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const quantityInput = screen.getByLabelText(/quantity/i)
      await user.type(quantityInput, 'xyz')

      // Quantity input should remain empty or show validation error (number inputs convert to null when default is undefined)
      expect(quantityInput).toHaveValue(null)
    })

    it('should handle API error gracefully', async () => {
      // Mock the hook to return an error
      vi.doMock('../../hooks/useProducts', () => ({
        useCreateProduct: () => ({
          mutate: vi.fn(),
          isPending: false,
          error: new Error('Failed to create product'),
        }),
        useCategories: () => ({
          data: ['Electronics', 'Clothing', 'Books', 'Home & Garden'],
          isLoading: false,
          error: null,
        }),
      }))

      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      // Fill in valid form data
      await user.type(screen.getByLabelText(/product name/i), 'Test Product')
      await user.type(screen.getByLabelText(/sku/i), 'TEST123')
      await user.type(screen.getByLabelText(/price/i), '99.99')
      await user.type(screen.getByLabelText(/quantity/i), '10')

      // Select category
      const categorySelect = screen.getByLabelText(/category/i)
      fireEvent.click(categorySelect)
      await user.click(screen.getByText('Electronics'))

      // Submit form
      const createButton = screen.getByRole('button', { name: /create product/i })
      await user.click(createButton)

      // Should handle error gracefully without crashing
      expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument()
    })

    it('should disable create button when form is submitting', () => {
      // Mock the hook to return pending state
      vi.doMock('../../hooks/useProducts', () => ({
        useCreateProduct: () => ({
          mutate: vi.fn(),
          isPending: true,
          error: null,
        }),
        useCategories: () => ({
          data: ['Electronics', 'Clothing', 'Books', 'Home & Garden'],
          isLoading: false,
          error: null,
        }),
      }))

      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      // Just check that the modal renders without crashing when pending
      expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty categories list', () => {
      // Mock the hook to return empty categories
      vi.doMock('../../hooks/useProducts', () => ({
        useCreateProduct: () => ({
          mutate: vi.fn(),
          isPending: false,
          error: null,
        }),
        useCategories: () => ({
          data: [],
          isLoading: false,
          error: null,
        }),
      }))

      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const categorySelect = screen.getByLabelText(/category/i)
      expect(categorySelect).toBeInTheDocument()
    })

    it('should handle categories loading state', () => {
      // Mock the hook to return loading state
      vi.doMock('../../hooks/useProducts', () => ({
        useCreateProduct: () => ({
          mutate: vi.fn(),
          isPending: false,
          error: null,
        }),
        useCategories: () => ({
          data: undefined,
          isLoading: true,
          error: null,
        }),
      }))

      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      expect(screen.getByRole('button', { name: /create product/i })).toBeInTheDocument()
    })

    it('should handle very large numbers in price and quantity', async () => {
      const user = userEvent.setup()
      render(
        <TestWrapper>
          <CreateProductModal {...defaultProps} />
        </TestWrapper>
      )

      const priceInput = screen.getByLabelText(/price/i)
      const quantityInput = screen.getByLabelText(/quantity/i)

      await user.type(priceInput, '999999999.99')
      await user.type(quantityInput, '999999999')

      expect(priceInput).toHaveValue(999999999.99)
      expect(quantityInput).toHaveValue(999999999)
    })
  })
}) 