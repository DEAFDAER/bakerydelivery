# Bongao Bakery Frontend

A modern React/TypeScript frontend for the Bongao Bakery Ordering and Delivery System. Built with Material-UI for a beautiful, responsive user experience.

## Features

- **Role-based Interface**: Different dashboards for customers, bakers, delivery personnel, and administrators
- **Product Management**: Browse, search, and filter bakery products
- **Order System**: Place orders, track status, and manage deliveries
- **Real-time Updates**: Live order status updates and notifications
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with Material Design
- **Authentication**: Secure JWT-based authentication system

## Tech Stack

- **React 18**: Latest React with hooks and functional components
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: Modern React component library
- **React Router**: Client-side routing
- **React Query**: Server state management and caching
- **React Hook Form**: Form validation and handling
- **React Hot Toast**: Beautiful notifications
- **Axios**: HTTP client for API communication

## Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML template
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.tsx         # Main navigation
│   │   └── ProtectedRoute.tsx # Route protection
│   ├── hooks/
│   │   └── useAuth.ts         # Authentication hook
│   ├── pages/                  # Page components
│   │   ├── LoginPage.tsx      # Login page
│   │   ├── RegisterPage.tsx   # Registration page
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── ProductsPage.tsx   # Product browsing
│   │   ├── OrdersPage.tsx     # Order management
│   │   ├── ProfilePage.tsx    # User profile
│   │   ├── BakerDashboard.tsx # Baker management
│   │   ├── DeliveryDashboard.tsx # Delivery management
│   │   └── AdminDashboard.tsx # Admin panel
│   ├── services/
│   │   └── api.ts             # API service layer
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── utils/
│   │   └── auth.ts            # Authentication utilities
│   ├── App.tsx                # Main app component
│   ├── main.tsx               # React entry point
│   └── index.css              # Global styles
├── .env                       # Environment variables
├── package.json               # Dependencies
├── tsconfig.json             # TypeScript configuration
└── README.md
```

## Installation

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   - Copy `.env` and update if needed:
   ```bash
   cp .env .env.local
   # Edit .env.local with your API URL if different from localhost:8000
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The app will automatically reload when you make changes

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Features by User Role

### 🛒 Customer
- Browse and search products with filters
- Add products to cart
- Place orders for delivery
- Track order status in real-time
- Manage profile and delivery addresses

### 👨‍🍳 Baker
- Add, edit, and manage bakery products
- Set product prices and stock levels
- View and manage customer orders
- Track order preparation status
- Manage product categories

### 🚚 Delivery Person
- View assigned deliveries
- Update delivery status (picked up, in transit, delivered)
- Add delivery notes and location tracking
- View delivery history and performance

### 👑 Administrator
- Complete system overview and analytics
- Manage all users and their roles
- Monitor all orders and system performance
- Access to all administrative functions
- User management and system configuration

## API Integration

The frontend communicates with the FastAPI backend through a comprehensive API service layer:

- **Authentication**: JWT-based login and registration
- **Products**: CRUD operations with filtering and search
- **Orders**: Order management and status tracking
- **Deliveries**: Delivery assignment and status updates
- **Users**: Profile management and administration

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:8000` |

## Development

### Adding New Features

1. **Components**: Create new components in `src/components/`
2. **Pages**: Add new pages in `src/pages/`
3. **API Integration**: Extend `src/services/api.ts`
4. **Types**: Update `src/types/index.ts` for new data structures
5. **Routing**: Add routes to `src/App.tsx`

### Code Quality

The project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks (if configured)

### Responsive Design

The application is fully responsive and optimized for:
- **Desktop** (1200px+)
- **Tablet** (768px - 1199px)
- **Mobile** (320px - 767px)

## Deployment

### Build for Production

```bash
npm run build
```

The `build` folder will contain the production-ready files.

### Deploy to Netlify/Vercel

1. Connect your repository to your deployment platform
2. Set build command: `npm run build`
3. Set publish directory: `build`
4. Add environment variables in the platform dashboard

### Deploy to Heroku

```bash
# Create a Procfile
echo "web: npm start" > Procfile

# Deploy
git add .
git commit -m "Deploy frontend"
git push heroku main
```

## Browser Support

- **Chrome** (latest)
- **Firefox** (latest)
- **Safari** (latest)
- **Edge** (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common Issues

1. **API Connection Issues**
   - Ensure the backend is running on the correct port
   - Check that `REACT_APP_API_URL` matches your backend URL
   - Verify CORS settings in the backend

2. **Authentication Problems**
   - Clear localStorage if tokens are corrupted
   - Check that JWT tokens are properly formatted
   - Verify user roles and permissions

3. **Build Errors**
   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` to reinstall dependencies
   - Check for TypeScript errors in the console

## Support

For support and questions:
- Check the browser console for error messages
- Verify API endpoints are accessible
- Ensure all environment variables are set correctly

---

**Built with ❤️ for Bongao Bakery**
