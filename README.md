# 📦 Inventory Management System - Frontend

A modern, full-featured inventory management system built with React, TypeScript, and Vite. This application provides a comprehensive solution for managing products, categories, and inventory operations with a professional user interface.

## 🚀 Features

### **Core Functionality**
- ✅ **Product Management**: Create, read, update, and delete products
- ✅ **Advanced Search**: Real-time search across product names, SKUs, and descriptions
- ✅ **Smart Filtering**: Filter by category, price range, and stock status
- ✅ **Pagination**: Efficient handling of large product datasets
- ✅ **Image Management**: Multiple image support for products
- ✅ **Stock Tracking**: Monitor inventory levels with low stock warnings

### **User Experience**
- ✅ **Responsive Design**: Mobile-first approach with Tailwind CSS
- ✅ **Real-time Validation**: Form validation with immediate feedback
- ✅ **Toast Notifications**: User-friendly success/error messages
- ✅ **Loading States**: Smooth loading indicators and skeleton screens
- ✅ **Professional UI**: Modern, clean interface with intuitive navigation

### **Authentication & Security**
- ✅ **User Authentication**: Secure login/registration system
- ✅ **Protected Routes**: Route-level access control
- ✅ **JWT Token Management**: Secure token-based authentication
- ✅ **Form Security**: Input validation and sanitization

### **Developer Experience**
- ✅ **TypeScript**: Full type safety and IntelliSense support
- ✅ **Component Testing**: Comprehensive unit test coverage (69/69 tests passing)
- ✅ **Error Handling**: Robust error boundaries and fallbacks
- ✅ **Code Quality**: ESLint and Prettier configuration
- ✅ **Hot Module Replacement**: Fast development with Vite HMR

## 🛠️ Technologies Used

### **Frontend Framework & Build Tools**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe JavaScript development
- **Vite** - Fast build tool with HMR support
- **React Router DOM** - Client-side routing and navigation

### **UI & Styling**
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful, customizable icons
- **CSS Modules** - Scoped styling approach

### **State Management & Data Fetching**
- **Zustand** - Lightweight state management
- **TanStack Query (React Query)** - Server state management and caching
- **Axios** - HTTP client for API requests

### **Form Handling & Validation**
- **React Hook Form** - Performant forms with minimal re-renders
- **Built-in Validation** - Custom validation rules and error handling

### **Testing Framework**
- **Vitest** - Fast unit test runner
- **React Testing Library** - Component testing utilities
- **jsdom** - DOM environment for testing
- **User Event** - Realistic user interaction testing

### **Development Tools**
- **ESLint** - Code linting and quality enforcement
- **Prettier** - Code formatting
- **TypeScript Compiler** - Type checking and compilation

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── ui/            # Base UI components (Button, Input)
│   │   ├── __tests__/     # Component unit tests
│   │   └── *.tsx          # Feature components
│   ├── pages/             # Route-level page components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand state stores
│   ├── services/          # API service layer
│   ├── types/             # TypeScript type definitions
│   ├── lib/               # Utility functions
│   └── __tests__/         # General unit tests
├── public/                # Static assets
└── package.json           # Dependencies and scripts
```

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd inventory-system/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file with your backend API URL
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 🧪 Testing

### **Run Unit Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test ProductsTable.test.tsx

# Run tests matching pattern
npm test -- --run -t "should render"
```

### **Test Coverage**
- **Total Tests**: 69/69 passing ✅
- **Components Tested**: 
  - ProductsTable: 12/12 tests
  - FilterDropdown: 12/12 tests  
  - CreateProductModal: 18/18 tests
  - Basic functionality: 27/27 tests

### **Test Categories**
- **Positive Tests**: Happy path scenarios and expected behavior
- **Negative Tests**: Error handling and invalid input scenarios
- **Edge Cases**: Boundary conditions and unusual inputs

## 📜 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm test             # Run unit tests
npm run test:watch   # Run tests in watch mode
npm run test:ui      # Run tests with UI interface

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run type-check   # Run TypeScript compiler check
```

## 🌟 Key Features Breakdown

### **Product Management**
- **Create Products**: Rich form with validation, image uploads, and category selection
- **Edit Products**: In-place editing with optimistic updates
- **Delete Products**: Confirmation dialogs and safe deletion
- **View Products**: Detailed product pages with all information

### **Search & Filtering**
- **Real-time Search**: Debounced search with instant results
- **Advanced Filters**: Category, price range, stock status filtering
- **Combined Search**: Search + filter combinations for precise results
- **URL State**: Filter states preserved in URL for sharing

### **User Interface**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Loading States**: Skeleton screens and loading indicators
- **Error States**: Graceful error handling with retry options
- **Empty States**: Helpful messages when no data is available

### **Performance Optimizations**
- **Code Splitting**: Lazy-loaded routes and components
- **Caching**: TanStack Query for intelligent data caching
- **Debouncing**: Search input debouncing to reduce API calls
- **Optimistic Updates**: Immediate UI updates for better UX

## 🚧 Features Not Yet Implemented

The following features are planned for future development:

### **User Settings & Profile Management**
- ❌ **Change Password**: User ability to update their password from settings
- ❌ **Profile Settings**: Edit user profile information (name, email, preferences)
- ❌ **Account Preferences**: Theme selection, notification settings, language preferences
- ❌ **User Avatar**: Profile picture upload and management

### **Enhanced Authentication**
- ❌ **Google OAuth Login**: Sign in with Google account integration
- ❌ **Social Media Login**: Facebook, GitHub, and other OAuth providers
- ❌ **Password Reset**: Forgot password functionality with email reset links


**Note**: These features represent the product roadmap and potential future enhancements. The current implementation focuses on core inventory management functionality with a solid foundation for future feature additions.

## 🐛 Bug Reports & Development Challenges

See the following files for detailed development documentation:
- **[BUG_REPORT.md](./BUG_REPORT.md)** - Comprehensive bug fixes and solutions
- **[STUCK.md](./STUCK.md)** - Development challenges and learning points

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using React, TypeScript, and modern web technologies**
