import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { useProductStore } from '../stores/productStore'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
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

const CreateProduct = () => {
  const [imageUrl, setImageUrl] = useState('')
  const [imageError, setImageError] = useState('')

  const { createProduct, isLoading } = useProductStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<CreateProductData>({
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      category: '',
      price: 0,
      quantity: 0,
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

  const onSubmit = async (data: CreateProductData) => {
    try {
      // Convert SKU to uppercase before submission
      const formData = {
        ...data,
        sku: data.sku.toUpperCase(),
        images: data.images || [],
      }

      await createProduct(formData)

      // Success toast
      toast.success('Product created successfully! 🎉', {
        duration: 3000,
      })

      reset()
      navigate('/products')
    } catch (error) {
      // Error toast
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create product'
      toast.error(errorMessage, {
        duration: 5000,
      })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Product</h1>
        <Button variant="outline" onClick={() => navigate('/products')}>
          Cancel
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
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
                      value.trim().length > 0 || 'Product name cannot be empty',
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
                  min="0"
                  step="0.01"
                  className="pl-10"
                  placeholder="0.00"
                  {...register('price', {
                    required: 'Price is required',
                    min: {
                      value: 0,
                      message: 'Price cannot be negative',
                    },
                    valueAsNumber: true,
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
                Quantity *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Warehouse className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="quantity"
                  type="number"
                  min="0"
                  className="pl-10"
                  placeholder="0"
                  {...register('quantity', {
                    required: 'Quantity is required',
                    min: {
                      value: 0,
                      message: 'Quantity cannot be negative',
                    },
                    valueAsNumber: true,
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
                  min="0"
                  className="pl-10"
                  placeholder="5"
                  {...register('minStockLevel', {
                    required: 'Minimum stock level is required',
                    min: {
                      value: 0,
                      message: 'Minimum stock level cannot be negative',
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

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images
            </label>
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Image className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="url"
                    className="pl-10"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={e => {
                      setImageUrl(e.target.value)
                      setImageError('')
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addImage}
                  disabled={!imageUrl.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {imageError && (
                <p className="text-sm text-red-600">{imageError}</p>
              )}

              {images.length > 0 && (
                <div className="space-y-2">
                  {images.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                    >
                      <Image className="h-4 w-4 text-gray-400" />
                      <span className="flex-1 text-sm truncate">{url}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || isSubmitting}
              className="min-w-[120px]"
            >
              {isLoading || isSubmitting ? 'Creating...' : 'Create Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateProduct
