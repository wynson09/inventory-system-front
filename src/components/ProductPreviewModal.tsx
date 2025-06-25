import { X, Package, Tag, DollarSign, Hash, Warehouse, Calendar } from 'lucide-react'
import { Button } from './ui/button'
import type { Product } from '../types'

interface ProductPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

const ProductPreviewModal = ({
  isOpen,
  onClose,
  product
}: ProductPreviewModalProps) => {
  if (!isOpen || !product) return null

  const getStockStatus = (quantity: number, minStockLevel: number) => {
    if (quantity === 0) {
      return { color: 'bg-red-500', status: 'Out of Stock', textColor: 'text-red-600' }
    } else if (quantity <= minStockLevel) {
      return { color: 'bg-yellow-500', status: 'Low Stock', textColor: 'text-yellow-600' }
    } else {
      return { color: 'bg-green-500', status: 'In Stock', textColor: 'text-green-600' }
    }
  }

  const getCategoryColor = (category: string) => {
    const categoryColors: Record<string, string> = {
      'Electronics': 'bg-blue-100 text-blue-800',
      'Clothing': 'bg-purple-100 text-purple-800',
      'Food & Beverage': 'bg-green-100 text-green-800',
      'Books': 'bg-yellow-100 text-yellow-800',
      'Home & Garden': 'bg-pink-100 text-pink-800',
      'Sports & Outdoors': 'bg-indigo-100 text-indigo-800',
      'Toys & Games': 'bg-red-100 text-red-800',
      'Health & Beauty': 'bg-teal-100 text-teal-800',
      'Automotive': 'bg-gray-100 text-gray-800',
      'Office Supplies': 'bg-orange-100 text-orange-800',
    }
    return categoryColors[category] || 'bg-gray-100 text-gray-800'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stockStatus = getStockStatus(product.quantity, product.minStockLevel)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Product Preview
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Product Image */}
          <div className="mb-6">
            <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>
            
            {/* Additional Images */}
            {product.images && product.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {product.images.slice(1).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`${product.name} ${index + 2}`}
                    className="w-16 h-16 object-cover rounded border flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Product Name</p>
                    <p className="text-gray-900 font-medium">{product.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Hash className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">SKU</p>
                    <p className="text-gray-900 font-mono">{product.sku}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Tag className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Category</p>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(product.category)}`}>
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Price</p>
                    <p className="text-gray-900 font-semibold text-lg">${product.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Description</h4>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{product.description}</p>
              </div>
            )}

            {/* Stock Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3">
                  <Warehouse className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Stock</p>
                    <p className="text-gray-900 font-semibold text-xl">{product.quantity}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Warehouse className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Min Stock Level</p>
                    <p className="text-gray-900 font-medium">{product.minStockLevel}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full ${stockStatus.color} mt-1`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Status</p>
                    <p className={`font-medium ${stockStatus.textColor}`}>{stockStatus.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timestamps */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Created</p>
                    <p className="text-gray-900">{formatDate(product.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Last Updated</p>
                    <p className="text-gray-900">{formatDate(product.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Status</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-medium ${product.isActive ? 'text-green-600' : 'text-red-600'}`}>
                  {product.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ProductPreviewModal 