import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { Add as AddIcon, Inventory, TrendingUp, Schedule } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import { Product, Order, ProductFormData } from '../types';
import toast from 'react-hot-toast';

const BakerDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { register: registerProduct, handleSubmit: handleSubmitProduct, reset: resetProduct, formState: { errors: productErrors } } = useForm<ProductFormData>();

  // Fetch baker's products
  const { data: products = [], isPending: productsLoading } = useQuery<Product[]>({
    queryKey: ['baker-products'],
    queryFn: () => apiService.getProducts()
  });

  // Fetch orders for baker management
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['baker-orders'],
    queryFn: () => apiService.getAllOrders()
  });

  // Create product mutation
  const createProductMutation = useMutation<Product, Error, ProductFormData>({
    mutationFn: (productData) => apiService.createProduct(productData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baker-products'] });
      toast.success('Product created successfully!');
      setShowProductForm(false);
      resetProduct();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create product');
    }
  });

  // Update product mutation
  const updateProductMutation = useMutation<Product, Error, { id: number; data: Partial<ProductFormData> }>({
    mutationFn: ({ id, data }) => apiService.updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baker-products'] });
      toast.success('Product updated successfully!');
      setEditingProduct(null);
      resetProduct();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update product');
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation<void, Error, number>({
    mutationFn: (id) => apiService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baker-products'] });
      toast.success('Product deleted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete product');
    }
  });

  const handleCreateProduct = (data: ProductFormData) => {
    createProductMutation.mutate(data);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    resetProduct({
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      stock_quantity: product.stock_quantity
    });
  };

  const handleUpdateProduct = (data: ProductFormData) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, data });
    }
  };

  const handleDeleteProduct = (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalValue = products.reduce((sum: number, product: Product) => sum + (product.price * product.stock_quantity), 0);
  const lowStockProducts = products.filter((product: Product) => product.stock_quantity < 10).length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Baker Dashboard
        </Typography>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Inventory color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{totalProducts}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Products
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(totalValue)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inventory Value
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{lowStockProducts}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Low Stock Items
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{orders.filter(o => o.status === 'pending').length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Orders
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowProductForm(true)}
            >
              Add Product
            </Button>
          </Box>
        </Box>

        {/* Products Management */}
        <Typography variant="h5" gutterBottom>
          My Products
        </Typography>

        {productsLoading ? (
          <Typography>Loading products...</Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.stock_quantity}
                        color={product.stock_quantity > 10 ? 'success' : product.stock_quantity > 0 ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.is_available ? 'Available' : 'Unavailable'}
                        color={product.is_available ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => handleEditProduct(product)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Product Form Dialog */}
        <Dialog open={showProductForm || !!editingProduct} onClose={() => {
          setShowProductForm(false);
          setEditingProduct(null);
          resetProduct();
        }} maxWidth="sm" fullWidth>
          <form onSubmit={handleSubmitProduct(editingProduct ? handleUpdateProduct : handleCreateProduct)}>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogContent>
              <TextField
                margin="normal"
                fullWidth
                label="Name"
                {...registerProduct('name', { required: 'Name is required' })}
                error={!!productErrors.name}
                helperText={productErrors.name?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                label="Description"
                {...registerProduct('description')}
                multiline
                rows={4}
              />
              <TextField
                margin="normal"
                fullWidth
                type="number"
                label="Price"
                {...registerProduct('price', {
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                error={!!productErrors.price}
                helperText={productErrors.price?.message}
              />
              <TextField
                margin="normal"
                fullWidth
                type="number"
                label="Stock Quantity"
                {...registerProduct('stock_quantity', {
                  required: 'Stock quantity is required',
                  min: { value: 0, message: 'Stock must be non-negative' }
                })}
                error={!!productErrors.stock_quantity}
                helperText={productErrors.stock_quantity?.message}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                setShowProductForm(false);
                setEditingProduct(null);
                resetProduct();
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

export default BakerDashboard;
