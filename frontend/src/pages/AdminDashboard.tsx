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
  IconButton,
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
  Edit,
  Delete,
  Add,
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
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

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

  // Filter baker users
  const bakerUsers = users.filter(u => u.role === 'baker');

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

  // Mutations
  const updateUserMutation = useMutation<void, Error, { id: number; userData: Partial<User> }>({
    mutationFn: async ({ id, userData }) => {
      await apiService.updateUser(id, userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated successfully!');
      setEditingUser(null);
      setUserDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update user');
    }
  });

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
    if (window.confirm('Are you sure you want to deactivate this baker?')) {
      await deactivateUserMutation.mutateAsync(userId);
    }
  };

  const handleActivateUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to activate this baker?')) {
      await updateUserMutation.mutateAsync({
        id: userId,
        userData: { is_active: true }
      });
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserDialogOpen(true);
  };

  const handleUpdateUser = async (userData: Partial<User>) => {
    if (editingUser) {
      await updateUserMutation.mutateAsync({
        id: editingUser.id,
        userData
      });
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
                  <BakeryDining color="warning" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{bakerUsers.length}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Bakers
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
            <Tab icon={<BakeryDining />} label="Bakers" />
            <Tab icon={<People />} label="All Users" />
            <Tab icon={<ShoppingCart />} label="Orders" />
            <Tab icon={<Inventory />} label="Products" />
          </Tabs>

          {/* Bakers Tab */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Baker Management ({bakerUsers.length} active bakers)
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setUserDialogOpen(true)}
              >
                Add Baker
              </Button>
            </Box>

            {bakerUsers.length === 0 ? (
              <Alert severity="info">No bakers found. Add your first baker to get started!</Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Phone</TableCell>
                      <TableCell>Products</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Joined</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bakerUsers.map((baker) => (
                      <TableRow key={baker.id} hover>
                        <TableCell>{baker.full_name}</TableCell>
                        <TableCell>{baker.email}</TableCell>
                        <TableCell>{baker.phone || 'Not provided'}</TableCell>
                        <TableCell>
                          {products.filter(p => p.baker_id === baker.id).length}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={baker.is_active ? 'Active' : 'Inactive'}
                            color={baker.is_active ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(baker.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => handleEditUser(baker)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                          {baker.is_active ? (
                            <IconButton
                              size="small"
                              onClick={() => handleDeactivateUser(baker.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          ) : (
                            <Button
                              size="small"
                              color="success"
                              variant="outlined"
                              onClick={() => handleActivateUser(baker.id)}
                            >
                              Activate
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* All Users Tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="h5" gutterBottom>
              User Management ({users.length} total users)
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
                            onClick={() => handleActivateUser(user.id)}
                          >
                            Activate
                          </Button>
                        )}
                        {user.is_active && user.id !== user?.id && (
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
          <TabPanel value={tabValue} index={2}>
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
          <TabPanel value={tabValue} index={3}>
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

        {/* Edit/Create User Dialog */}
        <Dialog
          open={userDialogOpen}
          onClose={() => {
            setUserDialogOpen(false);
            setEditingUser(null);
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingUser ? 'Edit Baker' : 'Add New Baker'}
          </DialogTitle>
          <DialogContent>
            <UserForm
              user={editingUser}
              onSubmit={handleUpdateUser}
              onCancel={() => {
                setUserDialogOpen(false);
                setEditingUser(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </Container>
  );
};

// User Form Component
interface UserFormProps {
  user: User | null;
  onSubmit: (userData: Partial<User>) => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    username: user?.username || '',
    phone: user?.phone || '',
    address: user?.address || '',
    role: user?.role || 'baker',
    is_active: user?.is_active ?? true,
  });

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(formData);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        label="Full Name"
        value={formData.full_name}
        onChange={handleChange('full_name')}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange('email')}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Username"
        value={formData.username}
        onChange={handleChange('username')}
        margin="normal"
        required
      />
      <TextField
        fullWidth
        label="Phone"
        value={formData.phone}
        onChange={handleChange('phone')}
        margin="normal"
      />
      <TextField
        fullWidth
        label="Address"
        value={formData.address}
        onChange={handleChange('address')}
        margin="normal"
        multiline
        rows={2}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Role</InputLabel>
        <Select
          value={formData.role}
          onChange={handleChange('role')}
          label="Role"
        >
          <MenuItem value="baker">Baker</MenuItem>
          <MenuItem value="delivery_person">Delivery Person</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        <Button type="submit" variant="contained" color="primary">
          {user ? 'Update' : 'Create'} Baker
        </Button>
        <Button type="button" variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
