import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FilterDropdown from '../FilterDropdown'
import type { ProductFilters } from '../../types'

describe('FilterDropdown', () => {
  const mockOnFiltersChange = vi.fn()
  const defaultFilters: ProductFilters = {
    category: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    inStock: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Positive Tests', () => {
    it('should render filter dropdown button', () => {
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      expect(screen.getByText('Filter options')).toBeInTheDocument()
    })

    it('should open dropdown when clicked', async () => {
      const user = userEvent.setup()
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const filterButton = screen.getByText('Filter options')
      await user.click(filterButton)

      expect(screen.getByText('Category')).toBeInTheDocument()
      expect(screen.getByText('Price')).toBeInTheDocument()
    })

    it('should show category options when category section is expanded', async () => {
      const user = userEvent.setup()
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const filterButton = screen.getByText('Filter options')
      await user.click(filterButton)

      // Category should be expanded by default, so options should be visible
      expect(screen.getByText('Electronics')).toBeInTheDocument()
      expect(screen.getByText('Clothing')).toBeInTheDocument()
    })

    it('should call onFiltersChange when filters are applied', async () => {
      const user = userEvent.setup()
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const filterButton = screen.getByText('Filter options')
      await user.click(filterButton)

      // Category should be expanded by default
      const electronicsCheckbox = screen.getByLabelText('Electronics')
      await user.click(electronicsCheckbox)

      // Click apply button to trigger onFiltersChange
      const applyButton = screen.getByText('Apply filters')
      await user.click(applyButton)

      expect(mockOnFiltersChange).toHaveBeenCalled()
    })
  })

  describe('Negative Tests', () => {
    it('should handle empty filter state', () => {
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      expect(screen.getByText('Filter options')).toBeInTheDocument()
    })

    it('should handle null filters gracefully', () => {
      const nullFilters = {} as ProductFilters
      render(
        <FilterDropdown
          filters={nullFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      expect(screen.getByText('Filter options')).toBeInTheDocument()
    })

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <FilterDropdown
            filters={defaultFilters}
            onFiltersChange={mockOnFiltersChange}
          />
          <div data-testid="outside">Outside element</div>
        </div>
      )

      const filterButton = screen.getByText('Filter options')
      await user.click(filterButton)

      expect(screen.getByText('Category')).toBeInTheDocument()

      const outsideElement = screen.getByTestId('outside')
      await user.click(outsideElement)

      expect(screen.queryByText('Category')).not.toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle active filters display', () => {
      const activeFilters: ProductFilters = {
        category: 'Electronics',
        minPrice: 10,
        maxPrice: 100,
        inStock: true,
      }

      render(
        <FilterDropdown
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      // Should show filter count badge or active state
      expect(screen.getByText('Filter options')).toBeInTheDocument()
    })

    it('should handle loading state', () => {
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
          isLoading={true}
        />
      )

      const filterButton = screen.getByText('Filter options')
      expect(filterButton).toBeDisabled()
    })

    it('should handle price input validation', async () => {
      const user = userEvent.setup()
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const filterButton = screen.getByText('Filter options')
      await user.click(filterButton)

      // Price should be expanded by default
      const minPriceInput = screen.getByPlaceholderText('Min')
      await user.type(minPriceInput, '10.99')

      expect(minPriceInput).toHaveValue(10.99)
    })

    it('should handle category selection', async () => {
      const user = userEvent.setup()
      render(
        <FilterDropdown
          filters={defaultFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const filterButton = screen.getByText('Filter options')
      await user.click(filterButton)

      // Category should be expanded by default
      const electronicsCheckbox = screen.getByLabelText('Electronics')
      expect(electronicsCheckbox).not.toBeChecked()

      await user.click(electronicsCheckbox)
      expect(electronicsCheckbox).toBeChecked()
    })

    it('should handle filter clearing', async () => {
      const user = userEvent.setup()
      const activeFilters: ProductFilters = {
        category: 'Electronics',
        minPrice: 10,
        maxPrice: 100,
        inStock: true,
      }

      render(
        <FilterDropdown
          filters={activeFilters}
          onFiltersChange={mockOnFiltersChange}
        />
      )

      const filterButton = screen.getByText('Filter options')
      await user.click(filterButton)

      const clearButton = screen.getByText('Clear all')
      await user.click(clearButton)

      expect(mockOnFiltersChange).toHaveBeenCalled()
    })
  })
}) 