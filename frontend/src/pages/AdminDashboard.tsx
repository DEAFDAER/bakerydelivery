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
  Tabs,
  Tab,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../services/api';
import type { User, Order, Product, DashboardStats } from '../types';
import { getErrorMessage } from '../utils/error';
import toast from 'react-hot-toast';
import {
  AdminPanelSettings,
  People,
  ShoppingCart,
  Inventory,
  TrendingUp,
  Schedule,
  CheckCircle,
  BakeryDining,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tabValue, setTabValue] = useState(0);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch dashboard stats
  const { data: stats = {} as DashboardStats } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiService.getDashboardStats()
  });

  // Fetch all users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiService.getUsers()
  });

  // Fetch all orders
  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['admin-orders'],
    queryFn: () => apiService.getAllOrders()
  });

  // Fetch all products
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['admin-products'],
    queryFn: () => apiService.getProducts()
  });

  // Deactivate user mutation
  const deactivateUserMutation = useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await apiService.deactivateUser(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User deactivated successfully!');
      setSelectedUser(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to deactivate user');
    }
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeactivateUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      await deactivateUserMutation.mutateAsync(userId);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'baker':
        return 'warning';
      case 'delivery_person':
        return 'info';
      default:
        return 'primary';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings />;
      case 'baker':
        return <BakeryDining />;
      case 'delivery_person':
        return <People />;
      default:
        return <People />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'error.main',
              mr: 3,
            }}
          >
            <AdminPanelSettings fontSize="large" />
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              System overview and management for Bongao Bakery
            </Typography>
          </Box>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp color="success" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{formatCurrency(stats?.total_revenue || 0)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Revenue
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
                  <ShoppingCart color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.total_orders || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Orders
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
                  <People color="info" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats?.total_customers || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Customers
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
                    <Typography variant="h4">{stats?.completed_deliveries || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completed Deliveries
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabs for different admin sections */}
        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="admin dashboard tabs"
          >
            <Tab icon={<People />} label="Users" />
            <Tab icon={<ShoppingCart />} label="Orders" />
            <Tab icon={<Inventory />} label="Products" />
            <Tab icon={<Schedule />} label="Pending Orders" />
          </Tabs>

          {/* Users Tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="h5" gutterBottom>
              User Management
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role.replace('_', ' ').toUpperCase()}
                          color={getRoleColor(user.role) as any}
                          icon={getRoleIcon(user.role)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.is_active ? 'Active' : 'Inactive'}
                          color={user.is_active ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          onClick={() => setSelectedUser(user)}
                          sx={{ mr: 1 }}
                        >
                          View
                        </Button>
                        {!user.is_active && (
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                          >
                            Activate
                          </Button>
                        )}
                        {user.is_active && user.id !== user.id && (
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDeactivateUser(user.id)}
                          >
                            Deactivate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Orders Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom>
              All Orders
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Order #</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell>#{order.id}</TableCell>
                      <TableCell>{order.customer.full_name}</TableCell>
                      <TableCell>{formatCurrency(order.final_amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={order.status.replace('_', ' ').toUpperCase()}
                          color={
                            order.status === 'delivered' ? 'success' :
                            order.status === 'cancelled' ? 'error' :
                            order.status === 'pending' ? 'warning' : 'primary'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button size="small">View Details</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Products Tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="h5" gutterBottom>
              Product Management
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Baker</TableCell>
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
                      <TableCell>{product.baker?.full_name || 'Unknown'}</TableCell>
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
                        <Button size="small">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          {/* Pending Orders Tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="h5" gutterBottom>
              Pending Orders ({orders.filter(o => o.status === 'pending').length})
            </Typography>
            {orders.filter(o => o.status === 'pending').length === 0 ? (
              <Alert severity="success">No pending orders!</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order #</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Ordered</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.filter(order => order.status === 'pending').map((order) => (
                      <TableRow key={order.id} hover>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>{order.customer.full_name}</TableCell>
                        <TableCell>{formatCurrency(order.final_amount)}</TableCell>
                        <TableCell>
                          {new Date(order.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button size="small" color="primary">
                            Process Order
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>

        {/* User Details Dialog */}
        <Dialog
          open={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          maxWidth="sm"
          fullWidth
        >
          {selectedUser && (
            <>
              <DialogTitle>
                User Details: {selectedUser.full_name}
              </DialogTitle>
              <DialogContent>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography>{selectedUser.email}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Username
                  </Typography>
                  <Typography>{selectedUser.username}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Role
                  </Typography>
                  <Chip
                    label={selectedUser.role.replace('_', ' ').toUpperCase()}
                    color={getRoleColor(selectedUser.role) as any}
                    icon={getRoleIcon(selectedUser.role)}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography>{selectedUser.phone || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography>{selectedUser.address || 'Not provided'}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Account Status
                  </Typography>
                  <Chip
                    label={selectedUser.is_active ? 'Active' : 'Inactive'}
                    color={selectedUser.is_active ? 'success' : 'error'}
                  />
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Joined
                  </Typography>
                  <Typography>
                    {new Date(selectedUser.created_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedUser(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard;
