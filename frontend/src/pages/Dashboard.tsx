import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Avatar,
  Chip,
} from '@mui/material';
import {
  BakeryDining,
  ShoppingCart,
  LocalShipping,
  AdminPanelSettings,
  Store,
  TrendingUp,
  Schedule,
  Inventory,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <AdminPanelSettings fontSize="large" />;
      case 'baker':
        return <BakeryDining fontSize="large" />;
      case 'delivery_person':
        return <LocalShipping fontSize="large" />;
      default:
        return <Store fontSize="large" />;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'error.main';
      case 'baker':
        return 'warning.main';
      case 'delivery_person':
        return 'info.main';
      default:
        return 'primary.main';
    }
  };

  const getRoleActions = (role: UserRole) => {
    switch (role) {
      case 'customer':
        return [
          {
            title: 'Browse Products',
            description: 'View our delicious bakery items',
            icon: <ShoppingCart />,
            action: () => navigate('/products'),
            color: 'primary',
          },
          {
            title: 'My Orders',
            description: 'Track your order status',
            icon: <Schedule />,
            action: () => navigate('/orders'),
            color: 'secondary',
          },
        ];
      case 'baker':
        return [
          {
            title: 'Manage Products',
            description: 'Add and update bakery items',
            icon: <Inventory />,
            action: () => navigate('/products'),
            color: 'warning',
          },
          {
            title: 'View Orders',
            description: 'Manage customer orders',
            icon: <ShoppingCart />,
            action: () => navigate('/orders'),
            color: 'primary',
          },
          {
            title: 'Baker Dashboard',
            description: 'Advanced baker tools',
            icon: <BakeryDining />,
            action: () => navigate('/baker'),
            color: 'secondary',
          },
        ];
      case 'delivery_person':
        return [
          {
            title: 'My Deliveries',
            description: 'View assigned deliveries',
            icon: <LocalShipping />,
            action: () => navigate('/delivery'),
            color: 'info',
          },
          {
            title: 'Order History',
            description: 'View completed deliveries',
            icon: <Schedule />,
            action: () => navigate('/orders'),
            color: 'primary',
          },
        ];
      case 'admin':
        return [
          {
            title: 'System Overview',
            description: 'View system statistics',
            icon: <TrendingUp />,
            action: () => navigate('/admin'),
            color: 'error',
          },
          {
            title: 'User Management',
            description: 'Manage users and roles',
            icon: <AdminPanelSettings />,
            action: () => navigate('/admin'),
            color: 'warning',
          },
          {
            title: 'All Orders',
            description: 'Monitor all orders',
            icon: <ShoppingCart />,
            action: () => navigate('/orders'),
            color: 'primary',
          },
        ];
      default:
        return [];
    }
  };

  const actions = getRoleActions(user?.role || 'customer');

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: getRoleColor(user?.role || 'customer'),
              mr: 3,
            }}
          >
            {getRoleIcon(user?.role || 'customer')}
          </Avatar>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.full_name}!
            </Typography>
            <Chip
              label={user?.role?.replace('_', ' ').toUpperCase()}
              color={
                user?.role === 'admin' ? 'error' :
                user?.role === 'baker' ? 'warning' :
                user?.role === 'delivery_person' ? 'info' : 'primary'
              }
              size="small"
            />
          </Box>
        </Box>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          Quick Actions
        </Typography>

        <Grid container spacing={3}>
          {actions.map((action, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar sx={{ bgcolor: `${action.color}.main`, mr: 2 }}>
                      {action.icon}
                    </Avatar>
                    <Typography variant="h6" component="div">
                      {action.title}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {action.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color={action.color as any}
                    onClick={action.action}
                  >
                    Get Started
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Welcome Message */}
        <Box sx={{ mt: 6, p: 4, bgcolor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            About Bongao Bakery
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to Bongao Bakery, your trusted local bakery in Bongao Province!
            We offer fresh, delicious baked goods made with love and delivered right to your doorstep.
          </Typography>
          <Typography variant="body1">
            {user?.role === 'customer' && (
              <>Browse our products, place orders, and enjoy fast delivery service.</>
            )}
            {user?.role === 'baker' && (
              <>Manage your products, fulfill orders, and grow your bakery business with us.</>
            )}
            {user?.role === 'delivery_person' && (
              <>Help us deliver happiness to our customers across Bongao Province.</>
            )}
            {user?.role === 'admin' && (
              <>Oversee operations, manage users, and ensure smooth service delivery.</>
            )}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Dashboard;
