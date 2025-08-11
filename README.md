# E-commerce Computer & Components Store

A full-stack e-commerce platform specializing in selling computers, laptops, and computer components, built with the MERN stack (MongoDB, Express, React, Node.js).

## Deployed website link: https://e-commerce-computers-selling.onrender.com/

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Docker Deployment](#docker-deployment)
- [API Endpoints](#api-endpoints)
- [Project Screenshots](#project-screenshots)
- [Contributing](#contributing)
- [License](#license)

## Features

- **User Authentication**: Sign up, login, Google OAuth integration
- **Product Browsing**: Advanced filtering, sorting, and searching capabilities
- **Product Categories**: Computers, laptops, processors, graphics cards, motherboards, memory, storage, and more
- **Shopping Cart**: Add, remove, and update product quantities
- **Checkout Process**: Address management, payment integration
- **Order Management**: View order history and track current orders
- **Admin Dashboard**: Manage products, orders, users, and discounts
- **Product Reviews**: Rate and review purchased products
- **Discount System**: Apply promo codes and discounts
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: WebSocket integration for inventory and order status updates

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose ODM
- JSON Web Token (JWT) authentication
- Passport.js for OAuth
- WebSockets (Socket.io)
- Multer for file uploads
- Nodemailer for email notifications

### Frontend
- React.js with Vite
- React Router for navigation
- Context API for state management
- Axios for API requests
- TailwindCSS for styling
- Chart.js for analytics
- React Toastify for notifications
- Socket.io client for real-time updates

### DevOps
- Docker & Docker Compose
- NGINX for frontend serving
- Environment configuration

## Project Structure

```
E-commerce-Computers-Selling/
├── frontend/                  # React frontend application
│   ├── public/                # Static files
│   └── src/
│       ├── assets/            # Images, fonts, etc.
│       ├── components/        # Reusable UI components
│       ├── context/           # React Context providers
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Application pages
│       ├── services/          # API service integrations
│       └── utils/             # Utility functions
├── src/                       # Backend Express application
│   ├── config/                # Configuration files
│   ├── Controllers/           # Route controllers
│   ├── Middlewares/           # Express middlewares
│   ├── Models/                # Mongoose models
│   ├── Routes/                # API routes
│   ├── services/              # Business logic services
│   ├── uploads/               # Uploaded product images
│   └── utils/                 # Utility functions
├── .env                       # Environment variables
├── docker-compose.yml         # Docker Compose configuration
└── package.json               # Backend dependencies
```

## Getting Started

### Prerequisites

- Node.js (v16+)
- MongoDB (Atlas)
- Git
- Docker

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jack20410/E-commerce-Computers-Selling.git
   cd E-commerce-Computers-Selling
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```
### Running Locally

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Access the application at:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Docker Deployment

1. Ensure Docker and Docker Compose are installed on your system

2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```

3. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth login
- `POST /auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get a single product
- `POST /api/products` - Create a new product (admin)
- `PUT /api/products/:id` - Update a product (admin)
- `DELETE /api/products/:id` - Delete a product (admin)

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/:id` - Get a single user
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete a user

### Orders
- `GET /api/orders` - Get all orders (for current user)
- `GET /api/orders/:id` - Get a single order
- `POST /api/orders` - Create a new order
- `PUT /api/orders/:id` - Update order status (admin)

### Reviews
- `GET /api/reviews/product/:productId` - Get reviews for a product
- `POST /api/reviews` - Create a product review
- `PUT /api/reviews/:id` - Update a review
- `DELETE /api/reviews/:id` - Delete a review

### Discounts
- `GET /api/discount` - Get all discount codes (admin)
- `POST /api/discount` - Create a discount code (admin)
- `PUT /api/discount/:id` - Update a discount code (admin)
- `DELETE /api/discount/:id` - Delete a discount code (admin)
- `POST /api/discount/verify` - Verify a discount code
