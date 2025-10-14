import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Avatar,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useForm } from 'react-hook-form';
import { PersonAddOutlined } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import { RegisterRequest, UserRole } from '../types';

interface RegisterFormData extends RegisterRequest {}

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser, loading } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    defaultValues: {
      role: 'customer',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerUser(data);
      navigate('/login');
    } catch (error: any) {
      if (error.response?.data?.detail) {
        setError('root', {
          type: 'manual',
          message: error.response.data.detail,
        });
      } else {
        setError('root', {
          type: 'manual',
          message: 'Registration failed. Please try again.',
        });
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <PersonAddOutlined />
          </Avatar>
          <Typography component="h1" variant="h4" gutterBottom>
            Bongao Bakery
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Create Account
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{ mt: 1, width: '100%' }}
          >
            {errors.root && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errors.root.message}
              </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Full Name"
              autoComplete="name"
              autoFocus
              {...register('full_name', {
                required: 'Full name is required',
                minLength: {
                  value: 2,
                  message: 'Full name must be at least 2 characters',
                },
              })}
              error={!!errors.full_name}
              helperText={errors.full_name?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              autoComplete="username"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
                pattern: {
                  value: /^[a-zA-Z0-9_]+$/,
                  message: 'Username can only contain letters, numbers, and underscores',
                },
              })}
              error={!!errors.username}
              helperText={errors.username?.message}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              type="email"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              })}
              error={!!errors.email}
              helperText={errors.email?.message}
            />

            <TextField
              margin="normal"
              fullWidth
              id="phone"
              label="Phone Number"
              autoComplete="tel"
              {...register('phone')}
            />

            <TextField
              margin="normal"
              fullWidth
              id="address"
              label="Address"
              multiline
              rows={2}
              {...register('address')}
            />

            <FormControl fullWidth margin="normal" required>
              <InputLabel id="role-label">Role</InputLabel>
              <Select
                labelId="role-label"
                id="role"
                label="Role"
                defaultValue="customer"
                value={selectedRole}
                {...register('role', { required: 'Role is required' })}
                error={!!errors.role}
              >
                <MenuItem value="customer">Customer</MenuItem>
                <MenuItem value="baker">Baker</MenuItem>
                <MenuItem value="delivery_person">Delivery Person</MenuItem>
              </Select>
              {errors.role && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  {errors.role.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              margin="normal"
              required
              fullWidth
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              error={!!errors.password}
              helperText={errors.password?.message}
            />

            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              {selectedRole === 'customer' && (
                <>As a customer, you can browse products and place orders for delivery.</>
              )}
              {selectedRole === 'baker' && (
                <>As a baker, you can manage products, view orders, and assign deliveries.</>
              )}
              {selectedRole === 'delivery_person' && (
                <>As a delivery person, you can update delivery status and track orders.</>
              )}
            </Alert>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: 'inherit', textDecoration: 'none' }}>
                    <Typography component="span" variant="body2" color="primary">
                      Sign In
                    </Typography>
                  </Link>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
