import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useCreateProduct } from '../hooks/useProducts'
import { Button } from './ui/button'
import { Input } from './ui/input'
import {
  Plus,
  Package,
  DollarSign,
  Hash,
  Tag,
  Warehouse,
  AlertCircle,
  Image,
  X,
} from 'lucide-react'
import type { CreateProductData } from '../types'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

const CreateProductModal = ({
  isOpen,
  onClose,
  onSuccess,
}: CreateProductModalProps) => {
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState('')

  const createProductMutation = useCreateProduct()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<CreateProductData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      category: '',
      price: undefined,
      quantity: undefined,
      minStockLevel: 5,
      images: [],
    },
  })

  // Watch images array for real-time updates
  const images = watch('images') || []

  // Common categories for dropdown
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

  const addImage = () => {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      // Basic URL validation
      const urlPattern = /^https?:\/\/.+/
      if (urlPattern.test(imageUrl.trim())) {
        setValue('images', [...images, imageUrl.trim()])
        setImageUrl('')
        setImageError('')
      } else {
        setImageError(
          'Please enter a valid URL (starting with http:// or https://)'
        )
      }
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setValue('images', updatedImages)
  }

  const handleClose = () => {
    reset()
    setImageUrl('')
    setImageError('')
    onClose()
  }

  const onSubmit = async (data: CreateProductData) => {
    // Convert SKU to uppercase before submission
    const formData = {
      ...data,
      sku: data.sku.toUpperCase(),
      images: data.images || [],
    }

    try {
      await createProductMutation.mutateAsync(formData)

      reset()
      setImageUrl('')
      setImageError('')
      onSuccess?.()
      onClose()
    } catch (error) {
      // Error is handled by the mutation's onError callback
      console.error('Create product failed:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Product
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    className="pl-10"
                    placeholder="Enter product name"
                    {...register('name', {
                      required: 'Product name is required',
                      maxLength: {
                        value: 100,
                        message: 'Product name cannot exceed 100 characters',
                      },
                      validate: value =>
                        value.trim().length > 0 ||
                        'Product name cannot be empty',
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="sku"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  SKU *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="sku"
                    type="text"
                    className="pl-10"
                    placeholder="Enter SKU (will be uppercase)"
                    {...register('sku', {
                      required: 'SKU is required',
                      minLength: {
                        value: 3,
                        message: 'SKU must be at least 3 characters',
                      },
                      maxLength: {
                        value: 50,
                        message: 'SKU cannot exceed 50 characters',
                      },
                      validate: value =>
                        value.trim().length > 0 || 'SKU cannot be empty',
                    })}
                    onChange={e => {
                      const value = e.target.value.toUpperCase()
                      setValue('sku', value)
                    }}
                  />
                </div>
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter product description (optional)"
                {...register('description', {
                  maxLength: {
                    value: 500,
                    message: 'Description cannot exceed 500 characters',
                  },
                })}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    id="category"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    {...register('category', {
                      required: 'Category is required',
                    })}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.category.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    className="pl-10"
                    placeholder="0.00"
                    {...register('price', {
                      required: 'Price is required',
                      min: {
                        value: 0.01,
                        message: 'Price must be greater than 0'
                      }
                    })}
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.price.message}
                  </p>
                )}
              </div>
            </div>

            {/* Inventory Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Initial Quantity *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Warehouse className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="quantity"
                    type="number"
                    className="pl-10"
                    placeholder="0"
                    {...register('quantity', {
                      required: 'Quantity is required',
                      min: {
                        value: 0,
                        message: 'Quantity must be 0 or greater'
                      }
                    })}
                  />
                </div>
                {errors.quantity && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="minStockLevel"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Minimum Stock Level *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="minStockLevel"
                    type="number"
                    className="pl-10"
                    placeholder="5"
                    {...register('minStockLevel', {
                      required: 'Minimum stock level is required',
                      min: {
                        value: 0,
                        message: 'Minimum stock level must be 0 or greater',
                      },
                      valueAsNumber: true,
                    })}
                  />
                </div>
                {errors.minStockLevel && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.minStockLevel.message}
                  </p>
                )}
              </div>
            </div>

            {/* Images Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images (Optional)
              </label>

              {/* Add Image Input */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1">
                  <Input
                    type="url"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={e => setImageUrl(e.target.value)}
                    className={imageError ? 'border-red-300' : ''}
                  />
                  {imageError && (
                    <p className="mt-1 text-sm text-red-600">{imageError}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImage}
                  disabled={!imageUrl.trim()}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              </div>

              {/* Images Preview */}
              {images.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Added Images:</p>
                  <div className="space-y-2">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                      >
                        <div className="flex items-center space-x-2">
                          <Image className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-700 truncate max-w-md">
                            {image}
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting || createProductMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || createProductMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting || createProductMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Product
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateProductModal
