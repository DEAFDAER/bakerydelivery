import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Fab,
  Badge,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Add as AddIcon, ShoppingCart, Edit, Delete } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { Product, Category, ProductFormData, ProductFilters } from '../types';
import { getErrorMessage } from '../utils/error';
import toast from 'react-hot-toast';

const ProductsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<ProductFilters>({});
  const [cart, setCart] = useState<Product[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>();

  // Fetch products
  const { data: products = [], isPending: productsLoading } = useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => apiService.getProducts(filters)
  });

  // Fetch categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: apiService.getCategories
  });

  // Add to cart mutation
  const addToCartMutation = useMutation<Product, Error, Product>({
    mutationFn: (product) => {
      // For now, just add to local state
      // In a real app, you'd send this to the backend
      return Promise.resolve(product);
    },
    onSuccess: () => {
      toast.success('Added to cart!');
    }
  });

  // Create product mutation
  const createProductMutation = useMutation<Product, Error, ProductFormData>({
    mutationFn: (productData) => apiService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully!');
      setShowProductForm(false);
      reset();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product');
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation<Product, Error, { id: number; data: Partial<ProductFormData> }>({
    mutationFn: ({ id, data }) => apiService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation<void, Error, number>({
    mutationFn: (id) => apiService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    }}
  );

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity > 0) {
      setCart([...cart, product]);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleCreateProduct = (data: ProductFormData) => {
    const userEmail = user?.email; // Get email from auth context
    if (!userEmail) {
      toast.error('You must be logged in to add products');
      return;
    }
    
    createProductMutation.mutate({
      ...data,
      baker_email: userEmail // Include user's email automatically
    });
  };

  const handleUpdateProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    reset({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity,
    });
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const isBakerOrAdmin = user?.role === 'baker' || user?.role === 'admin';

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Products</Typography>
          {isBakerOrAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setShowProductForm(true);
                reset({
                  name: '',
                  description: '',
                  price: 0,
                  image_url: '',
                  stock_quantity: 0,
                });
              }}
            >
              Add Product
            </Button>
          )}
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Search products"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={filters.min_price !== undefined || filters.max_price !== undefined 
                    ? `${filters.min_price || ''}-${filters.max_price || ''}` 
                    : ''}
                  onChange={(e) => {
                    if (!e.target.value) {
                      setFilters({
                        ...filters,
                        min_price: undefined,
                        max_price: undefined
                      });
                    } else {
                      const [min, max] = e.target.value.split('-');
                      setFilters({
                        ...filters,
                        min_price: min ? Number(min) : undefined,
                        max_price: max ? Number(max) : undefined,
                      });
                    }
                  }}
                >
                  <MenuItem value="">All Prices</MenuItem>
                  <MenuItem value="0-50">₱0 - ₱50</MenuItem>
                  <MenuItem value="50-100">₱50 - ₱100</MenuItem>
                  <MenuItem value="100-200">₱100 - ₱200</MenuItem>
                  <MenuItem value="200-">₱200+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Availability</InputLabel>
                <Select
                  value={filters.in_stock?.toString() || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    in_stock: e.target.value ? e.target.value === 'true' : undefined
                  })}
                >
                  <MenuItem value="">All Products</MenuItem>
                  <MenuItem value="true">In Stock</MenuItem>
                  <MenuItem value="false">Out of Stock</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Products Grid */}
        {productsLoading ? (
          <Typography>Loading products...</Typography>
        ) : (
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  {product.image_url && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={product.image_url}
                      alt={product.name}
                    />
                  )}
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {product.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6" color="primary">
                        ₱{product.price}
                      </Typography>
                      <Chip
                        label={product.is_available ? 'Available' : 'Out of Stock'}
                        color={product.is_available ? 'success' : 'default'}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Stock: {product.stock_quantity}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    {user?.role === 'customer' && (
                      <Button
                        size="small"
                        color="primary"
                        startIcon={<ShoppingCart />}
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.is_available || product.stock_quantity === 0}
                        fullWidth
                      >
                        Add to Cart
                      </Button>
                    )}
                    {isBakerOrAdmin && (
                      <>
                        <Button
                          size="small"
                          startIcon={<Edit />}
                          onClick={() => handleEditProduct(product)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Floating Cart Button */}
        {user?.role === 'customer' && (
          <Fab
            color="primary"
            aria-label="cart"
            sx={{ position: 'fixed', bottom: 16, right: 16 }}
            onClick={() => {
              setShowCart(true);
              console.log('Current cart:', cart); // For debugging
            }}
          >
            <Badge badgeContent={cart.length} color="error">
              <ShoppingCart />
            </Badge>
          </Fab>
        )}

        {/* Cart Dialog */}
        <Dialog open={showCart} onClose={() => setShowCart(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Your Cart</DialogTitle>
          <DialogContent>
            {cart.length === 0 ? (
              <Typography>Your cart is empty</Typography>
            ) : (
              <Box>
                {cart.map((item) => (
                  <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography>{item.name}</Typography>
                    <Typography>₱{item.price}</Typography>
                  </Box>
                ))}
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total: ₱{cart.reduce((sum, item) => sum + item.price, 0)}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCart(false)}>Continue Shopping</Button>
            {cart.length > 0 && (
              <Button variant="contained" color="primary" onClick={() => {
                setShowCart(false);
                // TODO: Implement checkout
              }}>
                Checkout
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Product Form Dialog */}
        <Dialog open={showProductForm || !!editingProduct} onClose={() => {
          setShowProductForm(false);
          setEditingProduct(null);
          reset();
        }} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmit(editingProduct ? handleUpdateProduct : handleCreateProduct)}>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogContent>
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                {...register('name', { required: 'Name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Description"
                {...register('description')}
                multiline
                rows={4}
              />
              <TextField
                margin="normal"
                fullWidth
                type="number"
                label="Price"
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                error={!!errors.price}
                helperText={errors.price?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                type="number"
                label="Stock Quantity"
                {...register('stock_quantity', {
                  required: 'Stock quantity is required',
                  min: { value: 0, message: 'Stock must be non-negative' }
                })}
                error={!!errors.stock_quantity}
                helperText={errors.stock_quantity?.message}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setShowProductForm(false);
                setEditingProduct(null);
                reset();
              }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained">
                {editingProduct ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProductsPage;
