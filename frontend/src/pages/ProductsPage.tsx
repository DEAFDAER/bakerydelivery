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
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [showCart, setShowCart] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductFormData>();
  
  // Separate form for checkout
  const { 
    register: registerCheckout, 
    handleSubmit: handleSubmitCheckout, 
    reset: resetCheckout, 
    formState: { errors: checkoutErrors } 
  } = useForm<{ delivery_address: string; delivery_instructions?: string }>();

  // Fetch products
  const { data: products = [], isPending: productsLoading } = useQuery<Product[]>({
    queryKey: ['products', filters],
    queryFn: () => apiService.getProducts(filters)
  });

  // Fetch categories
  const { data: categories = [], isPending: categoriesLoading, error: categoriesError } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiService.getCategories(),
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (categoriesError) {
      toast.error(`Failed to load categories: ${categoriesError.message}`);
    }
  }, [categoriesError]);

  // Add to cart mutation
  const addToCartMutation = useMutation<Product, Error, Product>({
    mutationFn: (product) => {
      // Add to local cart state
      setCart(prevCart => {
        const existingItem = prevCart.find(item => item.product.id === product.id);
        if (existingItem) {
          return prevCart.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prevCart, { product, quantity: 1 }];
      });
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

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: (orderData: { delivery_address: string; delivery_instructions?: string }) => {
      const items = cart.map(item => ({
        product_name: item.product.name,
        quantity: item.quantity
      }));
      return apiService.createOrder({
        ...orderData,
        items
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      setCart([]);
      setShowCart(false);
      resetCheckout();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to place order');
    }
  });

  const handleAddToCart = (product: Product) => {
    if (product.stock_quantity > 0) {
      addToCartMutation.mutate(product);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleCreateProduct = (data: ProductFormData) => {
    // Use a default baker email if user is not logged in
    const bakerEmail = user?.email || 'default@baker.com';
    const productDataWithBaker = {
      ...data,
      baker_email: bakerEmail,
    };
    createProductMutation.mutate(productDataWithBaker);
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
      category_name: product.category?.name || '',
    });
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
    toast.success('Removed from cart');
  };

  const handleUpdateCartQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const calculateCartTotal = () => {
    return cart.reduce((total, item) => total + item.product.price * item.quantity, 0);
  };

  const handleCheckout = (data: { delivery_address: string; delivery_instructions?: string }) => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    checkoutMutation.mutate(data);
  };

  const isBakerOrAdmin = user?.role === 'baker' || user?.role === 'admin';

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Products</Typography>
          {user?.role !== 'customer' && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowProductForm(true)}
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
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category_id || ''}
                  onChange={(e) => setFilters({
                    ...filters,
                    category_id: e.target.value ? Number(e.target.value) : undefined
                  })}
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Price Range</InputLabel>
                <Select
                  value={`${filters.min_price || ''}-${filters.max_price || ''}`}
                  onChange={(e) => {
                    const [min, max] = e.target.value.split('-');
                    setFilters({
                      ...filters,
                      min_price: min ? Number(min) : undefined,
                      max_price: max ? Number(max) : undefined,
                    });
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
                    {product.category && (
                      <Chip
                        label={product.category.name}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                  <CardActions>
                    {user?.role === 'customer' ? (
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
                    ) : (
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
        <Fab
          color="primary"
          aria-label="cart"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setShowCart(true)}
        >
          <Badge badgeContent={cart.length} color="error">
            <ShoppingCart />
          </Badge>
        </Fab>

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
                label="Product Name"
                {...register('name', { required: 'Product name is required' })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                multiline
                rows={3}
                label="Description"
                {...register('description')}
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
                label="Image URL"
                {...register('image_url')}
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
              <TextField
                margin="normal"
                fullWidth
                label="Category"
                {...register('category_name', { required: 'Category is required' })}
                error={!!errors.category_name}
                helperText={errors.category_name?.message}
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

        {/* Cart Dialog */}
        <Dialog
          open={showCart}
          onClose={() => setShowCart(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Shopping Cart ({cart.length} {cart.length === 1 ? 'item' : 'items'})
          </DialogTitle>
          <DialogContent>
            {cart.length === 0 ? (
              <Alert severity="info">Your cart is empty</Alert>
            ) : (
              <>
                {cart.map((item) => (
                  <Card key={item.product.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          {item.product.image_url && (
                            <CardMedia
                              component="img"
                              height="100"
                              image={item.product.image_url}
                              alt={item.product.name}
                            />
                          )}
                        </Grid>
                        <Grid item xs={12} sm={8}>
                          <Typography variant="h6">{item.product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            ₱{item.product.price} each
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                            <Button
                              size="small"
                              onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <TextField
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleUpdateCartQuantity(item.product.id, parseInt(e.target.value))}
                              inputProps={{ min: 1, max: item.product.stock_quantity }}
                              sx={{ width: '80px' }}
                              size="small"
                            />
                            <Button
                              size="small"
                              onClick={() => handleUpdateCartQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock_quantity}
                            >
                              +
                            </Button>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => handleRemoveFromCart(item.product.id)}
                            >
                              Remove
                            </Button>
                          </Box>
                          <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                            Subtotal: ₱{(item.product.price * item.quantity).toFixed(2)}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                ))}
                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="h6">Order Summary</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Typography>Subtotal:</Typography>
                    <Typography>₱{calculateCartTotal().toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography>Delivery Fee:</Typography>
                    <Typography>₱50.00</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography>Tax (12%):</Typography>
                    <Typography>₱{(calculateCartTotal() * 0.12).toFixed(2)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, fontWeight: 'bold' }}>
                    <Typography variant="h6">Total:</Typography>
                    <Typography variant="h6">
                      ₱{(calculateCartTotal() + 50 + calculateCartTotal() * 0.12).toFixed(2)}
                    </Typography>
                  </Box>
                </Box>

                <form onSubmit={handleSubmitCheckout(handleCheckout)}>
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Delivery Address"
                    multiline
                    rows={3}
                    {...registerCheckout('delivery_address', { required: 'Delivery address is required' })}
                    error={!!checkoutErrors.delivery_address}
                    helperText={checkoutErrors.delivery_address?.message}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Delivery Instructions (Optional)"
                    multiline
                    rows={2}
                    {...registerCheckout('delivery_instructions')}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    disabled={checkoutMutation.isPending || cart.length === 0}
                  >
                    {checkoutMutation.isPending ? 'Processing...' : 'Place Order'}
                  </Button>
                </form>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCart(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ProductsPage;
