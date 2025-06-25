import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { Button } from './ui/button'
import { Package, Home, LogOut, User, Settings, ChevronDown } from 'lucide-react'

const Layout = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleLogout = () => {
    logout()
    navigate('/login')
    setIsDropdownOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-semibold text-gray-900">
                Inventory System
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Welcome text - hidden on mobile */}
              <span className="hidden md:block text-sm text-gray-700">
                Welcome, {user?.firstName}
              </span>
              
              {/* User Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 p-2"
                >
                  <User className="h-4 w-4" />
                  <ChevronDown className="h-3 w-3" />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-600 rounded-lg shadow-lg border border-gray-500 z-50">
                    {/* User Info Section */}
                    <div className="px-4 py-4 border-b border-gray-500">
                      <div className="text-sm text-gray-300 mb-3">
                        {user?.email || 'user@example.com'}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-white font-medium">
                          {user?.firstName} {user?.lastName}
                        </span>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-3">
                        <Settings className="h-4 w-4" />
                        <span>Settings</span>
                      </button>
                      <button 
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-3"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/products"
              className="flex items-center space-x-2 px-3 py-4 text-sm font-medium text-gray-700 hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600"
            >
              <Package className="h-4 w-4" />
              <span>Products</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
