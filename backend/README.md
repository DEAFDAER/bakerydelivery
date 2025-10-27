# Bongao Bakery API

A comprehensive bakery management system API built with FastAPI, SQLAlchemy, and PostgreSQL/SQLite.

## Features

- **User Management**: Multi-role system (Admin, Baker, Delivery Person, Customer)
- **Product Management**: CRUD operations for bakery products with categories
- **Order Management**: Complete order lifecycle from creation to delivery
- **Delivery Tracking**: Real-time delivery status updates
- **Authentication**: JWT-based authentication with role-based access control
- **Dashboard**: Role-specific dashboards with statistics and analytics

## Quick Start

### Prerequisites

- Python 3.8+
- pip
- SQLite (default) or PostgreSQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

5. **Initialize database**
   ```bash
   python init_db.py
   ```

6. **Start the server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

   Or use the startup script:
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

### Default Users

After running `init_db.py`, the following users are created:

- **Admin**: `admin@bongao-bakery.com` / `admin123`
- **Baker**: `baker@bongao-bakery.com` / `baker123`
- **Delivery Person**: `delivery@bongao-bakery.com` / `delivery123`
- **Customer**: `customer@bongao-bakery.com` / `customer123`

## API Documentation

Once the server is running, visit:
- **Interactive API docs**: http://localhost:8000/docs
- **ReDoc documentation**: http://localhost:8000/redoc
- **OpenAPI schema**: http://localhost:8000/openapi.json

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login with email/password
- `GET /me` - Get current user info

### Users (`/api/users`)
- `GET /` - Get all users (admin only)
- `GET /{user_id}` - Get user by ID
- `PUT /{user_id}` - Update user
- `DELETE /{user_id}` - Deactivate user (admin only)

### Categories (`/api/categories`)
- `GET /` - Get all categories
- `POST /` - Create category (admin only)
- `PUT /{category_id}` - Update category (admin only)
- `DELETE /{category_id}` - Delete category (admin only)

### Products (`/api/products`)
- `GET /` - Get all products with filtering
- `POST /` - Create product (baker only)
- `PUT /{product_id}` - Update product
- `PATCH /{product_id}/stock` - Update stock (baker only)

### Orders (`/api/orders`)
- `GET /` - Get orders
- `POST /` - Create new order
- `PUT /{order_id}` - Update order
- `PATCH /{order_id}/status` - Update order status

### Deliveries (`/api/deliveries`)
- `GET /` - Get deliveries
- `POST /` - Create delivery (admin only)
- `PATCH /{delivery_id}/assign` - Assign delivery person
- `PATCH /{delivery_id}/status` - Update delivery status

### Dashboard (`/api/dashboard`)
- `GET /stats` - Get admin dashboard stats
- `GET /baker/stats` - Get baker stats
- `GET /delivery-person/stats` - Get delivery person stats
- `GET /customer/stats` - Get customer stats

## Database Schema

The API uses the following main entities:

- **Users**: Admin, Baker, Delivery Person, Customer
- **Categories**: Product categories
- **Products**: Bakery items with pricing and stock
- **Orders**: Customer orders with items
- **OrderItems**: Individual items in orders
- **Deliveries**: Delivery tracking and assignment

## Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL=sqlite:///./bakery.db

# JWT
SECRET_KEY=your-secret-key
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
ALLOWED_ORIGINS=http://localhost:3000

# Other settings
ENVIRONMENT=development
DEBUG=True
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black app/
```

### Linting
```bash
flake8 app/
```

### Database Migrations
```bash
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

## Production Deployment

1. **Set production environment variables**
2. **Use PostgreSQL instead of SQLite**
3. **Set up proper CORS origins**
4. **Use a production WSGI server like Gunicorn**
5. **Set up proper logging and monitoring**

```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.
