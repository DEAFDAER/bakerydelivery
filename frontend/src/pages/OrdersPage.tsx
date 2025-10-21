import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { Order, OrderStatus, OrderFormData } from '../types';
import { getErrorMessage } from '../utils/error';
import toast from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<OrderFormData>();

  // Fetch orders based on user role
  const { data: orders = [], isPending } = useQuery<Order[]>({
    queryKey: ['orders', user?.role],
    queryFn: async () => {
      if (user?.role === 'admin' || user?.role === 'baker') {
        return await apiService.getAllOrders();
      } else {
        return await apiService.getOrders();
      }
    }
  });

  // Update order status mutation
  const updateOrderStatusMutation = useMutation<void, Error, { id: number; status: OrderStatus }>({
    mutationFn: ({ id, status }) => apiService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order status updated successfully!');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    }
  });

  const handleStatusUpdate = (orderId: number, newStatus: OrderStatus) => {
    updateOrderStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'preparing':
        return 'primary';
      case 'ready':
        return 'secondary';
      case 'out_for_delivery':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            {user?.role === 'customer' ? 'My Orders' : 'All Orders'}
          </Typography>
          {user?.role === 'customer' && (
            <Button
              variant="contained"
              onClick={() => setShowOrderForm(true)}
            >
              Place New Order
            </Button>
          )}
        </Box>

        {isPending ? (
          <Typography>Loading orders...</Typography>
        ) : orders.length === 0 ? (
          <Alert severity="info">No orders found.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id} hover>
                    <TableCell>#{order.id}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>
                      {user?.role === 'customer' ? 'You' : order.customer.full_name}
                    </TableCell>
                    <TableCell>
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </TableCell>
                    <TableCell>{formatCurrency(order.final_amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(order.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </Button>
                      {(user?.role === 'baker' || user?.role === 'admin') && (
                        <FormControl size="small" sx={{ ml: 1, minWidth: 120 }}>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={order.status}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value as OrderStatus)}
                            label="Status"
                          >
                            <MenuItem value="pending">Pending</MenuItem>
                            <MenuItem value="confirmed">Confirmed</MenuItem>
                            <MenuItem value="preparing">Preparing</MenuItem>
                            <MenuItem value="ready">Ready</MenuItem>
                            <MenuItem value="out_for_delivery">Out for Delivery</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                            <MenuItem value="cancelled">Cancelled</MenuItem>
                          </Select>
                        </FormControl>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Order Details Dialog */}
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedOrder && (
            <>
              <DialogTitle>
                Order Details #{selectedOrder.id}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Order Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedOrder.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(selectedOrder.status) as any}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Order Date
                      </Typography>
                      <Typography>{formatDate(selectedOrder.created_at)}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Address
                      </Typography>
                      <Typography>{selectedOrder.delivery_address}</Typography>
                    </Box>
                    {selectedOrder.delivery_instructions && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Delivery Instructions
                        </Typography>
                        <Typography>{selectedOrder.delivery_instructions}</Typography>
                      </Box>
                    )}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Order Items
                    </Typography>
                    {selectedOrder.items.map((item) => (
                      <Card key={item.id} sx={{ mb: 2 }}>
                        <CardContent>
                          <Typography variant="h6">{item.product.name}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Quantity: {item.quantity}
                          </Typography>
                          <Typography variant="body2">
                            Unit Price: {formatCurrency(item.unit_price)}
                          </Typography>
                          <Typography variant="h6" color="primary">
                            Total: {formatCurrency(item.total_price)}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        Order Summary
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Subtotal:</Typography>
                        <Typography>{formatCurrency(selectedOrder.total_amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Delivery Fee:</Typography>
                        <Typography>{formatCurrency(selectedOrder.delivery_fee)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography>Tax:</Typography>
                        <Typography>{formatCurrency(selectedOrder.tax_amount)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                        <Typography>Total:</Typography>
                        <Typography>{formatCurrency(selectedOrder.final_amount)}</Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedOrder(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* New Order Form Dialog */}
        <Dialog
          open={showOrderForm}
          onClose={() => setShowOrderForm(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Place New Order</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              fullWidth
              label="Delivery Address"
              multiline
              rows={3}
              {...register('delivery_address', { required: 'Delivery address is required' })}
              error={!!errors.delivery_address}
              helperText={errors.delivery_address?.message}
            />
            <TextField
              margin="normal"
              fullWidth
              label="Delivery Instructions (Optional)"
              multiline
              rows={2}
              {...register('delivery_instructions')}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              Add items to your cart from the Products page first, then place your order.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowOrderForm(false)}>Cancel</Button>
            <Button variant="contained" disabled>
              Place Order (Coming Soon)
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default OrdersPage;
