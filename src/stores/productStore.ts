import { create } from 'zustand';
import type { Product, CreateProductData, UpdateProductData, ProductFilters } from '../types';
import { apiService } from '../services/api';

interface ProductStore {
  products: Product[];
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters: ProductFilters;
  
  // Actions
  fetchProducts: (params?: { page?: number; limit?: number }) => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (productData: CreateProductData) => Promise<void>;
  updateProduct: (id: string, productData: UpdateProductData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  clearError: () => void;
  setCurrentProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  currentProduct: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  filters: {},

  fetchProducts: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const { page = 1, limit = 10 } = params;
      const { filters } = get();
      
      const response = await apiService.getProducts({
        page,
        limit,
        search: filters.search,
        category: filters.category,
      });
      
      if (response.success && response.data) {
        set({
          products: response.data.items,
          pagination: response.data.pagination,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getProduct(id);
      if (response.success && response.data) {
        set({
          currentProduct: response.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Failed to fetch product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch product';
      set({ error: errorMessage, isLoading: false });
    }
  },

  createProduct: async (productData: CreateProductData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.createProduct(productData);
      if (response.success && response.data) {
        const { products } = get();
        set({
          products: [response.data, ...products],
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateProduct: async (id: string, productData: UpdateProductData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.updateProduct(id, productData);
      if (response.success && response.data) {
        const { products } = get();
        const updatedProducts = products.map(product =>
          product._id === id ? response.data! : product
        );
        set({
          products: updatedProducts,
          currentProduct: response.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.deleteProduct(id);
      if (response.success) {
        const { products } = get();
        const filteredProducts = products.filter(product => product._id !== id);
        set({
          products: filteredProducts,
          currentProduct: null,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.searchProducts(query);
      if (response.success && response.data) {
        set({
          products: response.data.items,
          pagination: response.data.pagination,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Search failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      set({ error: errorMessage, isLoading: false });
    }
  },

  setFilters: (filters: ProductFilters) => {
    set({ filters });
  },

  clearError: () => {
    set({ error: null });
  },

  setCurrentProduct: (product: Product | null) => {
    set({ currentProduct: product });
  },
})); 