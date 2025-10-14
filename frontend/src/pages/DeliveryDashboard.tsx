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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Avatar,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { Delivery, OrderStatus } from '../types';
import { getErrorMessage } from '../utils/error';
import toast from 'react-hot-toast';
import { LocalShipping, CheckCircle, Schedule, Map } from '@mui/icons-material';

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Fetch deliveries for current delivery person
  const { data: deliveries = [], isPending } = useQuery<Delivery[]>({
    queryKey: ['deliveries', user?.id],
    queryFn: () => apiService.getDeliveries()
  });

  // Update delivery status mutation
  const updateDeliveryStatusMutation = useMutation<
    void,
    Error,
    { id: number; status: string; notes?: string }
  >({
    mutationFn: ({ id, status }) => apiService.updateDeliveryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      toast.success('Delivery status updated successfully!');
      setSelectedDelivery(null);
      setDeliveryNotes('');
    },
    onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    }
  );

  const handleStatusUpdate = (deliveryId: number, newStatus: string) => {
    updateDeliveryStatusMutation.mutate({
      id: deliveryId,
      status: newStatus,
      notes: deliveryNotes || undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'warning';
      case 'picked_up':
        return 'info';
      case 'in_transit':
        return 'primary';
      case 'delivered':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Schedule />;
      case 'picked_up':
        return <LocalShipping />;
      case 'in_transit':
        return <Map />;
      case 'delivered':
        return <CheckCircle />;
      default:
        return <Schedule />;
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  // Calculate stats
  const totalDeliveries = deliveries.length;
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered').length;
  const pendingDeliveries = deliveries.filter(d => d.status === 'assigned').length;
  const inTransitDeliveries = deliveries.filter(d => d.status === 'in_transit').length;

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'info.main',
              mr: 3,
            }}
          >
            <LocalShipping fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Delivery Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {user?.full_name}! Manage your deliveries here.
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Schedule color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{pendingDeliveries}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Deliveries
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
                  <Map color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{inTransitDeliveries}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      In Transit
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
                  <CheckCircle color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{completedDeliveries}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Today
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
                  <LocalShipping color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{totalDeliveries}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Deliveries
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Deliveries Table */}
        <Typography variant="h5" gutterBottom>
          My Deliveries
        </Typography>

        {isPending ? (
          <Typography>Loading deliveries...</Typography>
        ) : deliveries.length === 0 ? (
          <Alert severity="info">No deliveries assigned to you yet.</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order #</TableCell>
                  <TableCell>Customer</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveries.map((delivery) => (
                  <TableRow key={delivery.id} hover>
                    <TableCell>#{delivery.order.id}</TableCell>
                    <TableCell>{delivery.order.customer.full_name}</TableCell>
                    <TableCell>{delivery.order.delivery_address}</TableCell>
                    <TableCell>{formatCurrency(delivery.order.final_amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={delivery.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(delivery.status) as any}
                        icon={getStatusIcon(delivery.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{formatDate(delivery.assigned_at)}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => setSelectedDelivery(delivery)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Delivery Details Dialog */}
        <Dialog
          open={!!selectedDelivery}
          onClose={() => setSelectedDelivery(null)}
          maxWidth="md"
          fullWidth
        >
          {selectedDelivery && (
            <>
              <DialogTitle>
                Delivery Details #{selectedDelivery.order.id}
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Order Information
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Customer
                      </Typography>
                      <Typography>{selectedDelivery.order.customer.full_name}</Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Delivery Address
                      </Typography>
                      <Typography>{selectedDelivery.order.delivery_address}</Typography>
                    </Box>
                    {selectedDelivery.order.delivery_instructions && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Instructions
                        </Typography>
                        <Typography>{selectedDelivery.order.delivery_instructions}</Typography>
                      </Box>
                    )}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Order Total
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(selectedDelivery.order.final_amount)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h6" gutterBottom>
                      Delivery Status
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Status
                      </Typography>
                      <Chip
                        label={selectedDelivery.status.replace('_', ' ').toUpperCase()}
                        color={getStatusColor(selectedDelivery.status) as any}
                        icon={getStatusIcon(selectedDelivery.status)}
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Assigned At
                      </Typography>
                      <Typography>{formatDate(selectedDelivery.assigned_at)}</Typography>
                    </Box>
                    {selectedDelivery.picked_up_at && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Picked Up At
                        </Typography>
                        <Typography>{formatDate(selectedDelivery.picked_up_at)}</Typography>
                      </Box>
                    )}
                    {selectedDelivery.delivered_at && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Delivered At
                        </Typography>
                        <Typography>{formatDate(selectedDelivery.delivered_at)}</Typography>
                      </Box>
                    )}
                    {selectedDelivery.delivery_notes && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Notes
                        </Typography>
                        <Typography>{selectedDelivery.delivery_notes}</Typography>
                      </Box>
                    )}
                  </Grid>
                </Grid>

                {/* Order Items */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Order Items
                  </Typography>
                  {selectedDelivery.order.items.map((item) => (
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
                </Box>

                {/* Status Update Section */}
                {selectedDelivery.status !== 'delivered' && (
                  <Box sx={{ mt: 3, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Update Delivery Status
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                          <InputLabel>Status</InputLabel>
                          <Select
                            value={selectedDelivery.status}
                            onChange={(e) => handleStatusUpdate(selectedDelivery.id, e.target.value)}
                          >
                            <MenuItem value="assigned">Assigned</MenuItem>
                            <MenuItem value="picked_up">Picked Up</MenuItem>
                            <MenuItem value="in_transit">In Transit</MenuItem>
                            <MenuItem value="delivered">Delivered</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Delivery Notes (Optional)"
                          multiline
                          rows={2}
                          value={deliveryNotes}
                          onChange={(e) => setDeliveryNotes(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedDelivery(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default DeliveryDashboard;
