# LunchBox Express - Complete Production System

A comprehensive digital dabbawala service for school children with real-time tracking, multi-user dashboards, and complete order management.

## 🚀 Features

### Backend Features
- **Complete REST API** with Express.js and PostgreSQL
- **Real-time Updates** with Socket.IO
- **JWT Authentication** with role-based access control
- **Database Schema** with proper relationships and indexing
- **File Upload** support for menu item images
- **Rate Limiting** and security middleware
- **Input Validation** with Joi
- **Error Handling** and logging
- **Location-based System** for Nellore city with door number mapping

### Frontend Features
- **Multi-User Dashboards** (Parent, Delivery, School, Admin, Caterer)
- **Real-time Order Tracking** with status updates
- **Shopping Cart** functionality for caterer orders
- **Loyalty Points System** with redemption
- **Notification System** with unread counts
- **Responsive Design** for all devices
- **Payment Integration** with UPI options
- **Location Mapping** with distance calculation and delivery charges

## 📁 Project Structure

```
├── database/
│   └── schema.sql              # Complete PostgreSQL schema
├── server/
│   ├── config/
│   │   ├── database.js         # Database connection
│   │   ├── jwt.js             # JWT configuration
│   │   └── multer.js          # File upload config
│   ├── models/
│   │   ├── User.js            # User model with roles
│   │   ├── Student.js         # Children/student model
│   │   ├── Order.js           # Order model with status
│   │   ├── Menu.js            # Menu items model
│   │   └── Notification.js    # Notifications model
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── userController.js  # User management
│   │   ├── orderController.js # Order management
│   │   └── menuController.js  # Menu management
│   ├── middleware/
│   │   ├── auth.js            # JWT verification
│   │   ├── roleAuth.js        # Role-based access
│   │   └── validation.js      # Input validation
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── users.js           # User routes
│   │   ├── orders.js          # Order routes
│   │   └── menu.js            # Menu routes
│   ├── utils/
│   │   └── locationHelper.js  # Location mapping utilities
│   └── server.js              # Express server
├── src/
│   ├── services/
│   │   ├── api.ts             # Axios configuration
│   │   ├── authService.ts     # Auth API calls
│   │   ├── orderService.ts    # Order API calls
│   │   └── menuService.ts     # Menu API calls
│   ├── hooks/
│   │   ├── useAuth.tsx        # Authentication hook
│   │   ├── useOrders.tsx      # Orders hook
│   │   └── useRealTime.tsx    # WebSocket hook
│   └── utils/
│       ├── constants.ts       # App constants
│       └── helpers.ts         # Utility functions
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Database Setup
1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE lunchbox_db;
```

2. Run the schema file:
```bash
psql -U postgres -d lunchbox_db -f database/schema.sql
```

### Backend Setup
1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lunchbox_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
PORT=5000
FRONTEND_URL=http://localhost:5173
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup
1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

## 🏃‍♂️ How to Run in VS Code

### Step 1: Install Required Software
1. **Node.js**: Download from [nodejs.org](https://nodejs.org/) (v16 or higher)
2. **PostgreSQL**: Download from [postgresql.org](https://www.postgresql.org/download/)
3. **VS Code**: Download from [code.visualstudio.com](https://code.visualstudio.com/)

### Step 2: Setup Database
1. Open PostgreSQL command line (psql)
2. Create database:
   ```sql
   CREATE DATABASE lunchbox_db;
   ```
3. Run the schema:
   ```bash
   psql -U postgres -d lunchbox_db -f database/schema.sql
   ```

### Step 3: Setup Backend
1. Open terminal in VS Code
2. Navigate to server folder:
   ```bash
   cd server
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create `.env` file and add your database credentials
5. Start backend server:
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:5000`

### Step 4: Setup Frontend
1. Open new terminal in VS Code
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start frontend:
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🌍 Location System - Nellore City

The system uses a unique door number mapping for Nellore city:

### Door Number Format: [Type][Location][Number]
- **Type**: H=House, S=School, C=Caterer, D=Delivery
- **Location**: 1=Balaji Nagar, 2=AC Nagar, 3=Stonehousepeta, 4=Harinathpuram
- **Number**: 01-04 for houses, 01 for school/caterer

### Examples:
- `H101` = House 1 in Balaji Nagar
- `S201` = School in AC Nagar
- `C301` = Caterer in Stonehousepeta

### Locations:
1. **Balaji Nagar** - 4 houses, 1 school, 1 caterer
2. **AC Nagar** - 4 houses, 1 school, 1 caterer
3. **Stonehousepeta** - 4 houses, 1 school, 1 caterer
4. **Harinathpuram** - 4 houses, 1 school, 1 caterer

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

### Users
- `POST /api/users/children` - Add child (Parent only)
- `GET /api/users/children` - Get children (Parent only)
- `PUT /api/users/children/:id` - Update child
- `DELETE /api/users/children/:id` - Delete child

### Orders
- `POST /api/orders` - Create order (Parent only)
- `GET /api/orders` - Get orders (Role-based)
- `GET /api/orders/pending` - Get pending orders (Delivery only)
- `PUT /api/orders/:id/accept` - Accept order (Delivery only)
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/today` - Get today's orders

### Menu
- `POST /api/menu` - Create menu item (Caterer only)
- `GET /api/menu` - Get menu items
- `PUT /api/menu/:id` - Update menu item
- `PUT /api/menu/:id/toggle` - Toggle availability

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

## 🔄 Real-time Features

The application uses Socket.IO for real-time updates:

- **Order Status Updates** - Parents see live delivery progress
- **New Order Notifications** - Delivery staff get instant alerts
- **Dashboard Synchronization** - All dashboards update in real-time
- **Notification System** - Instant push notifications

## 🛡️ Security Features

- **JWT Authentication** with secure token handling
- **Role-based Access Control** for API endpoints
- **Input Validation** with Joi schemas
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for secure cross-origin requests
- **Helmet.js** for security headers
- **Password Hashing** with bcrypt

## 📱 Mobile Responsive

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Production Deployment

### Environment Variables
Set these environment variables for production:

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_NAME=your_production_db_name
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
JWT_SECRET=your_production_jwt_secret
FRONTEND_URL=https://your-frontend-domain.com
```

### Database Migration
Run the schema file on your production database and ensure proper indexing for performance.

### SSL Configuration
Configure SSL certificates for HTTPS in production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support, email support@lunchboxexpress.com or call +91-9999999999.