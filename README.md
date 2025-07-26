# 🏨 SheyRooms - Hotel Booking System

A modern, full-stack hotel booking system built with React.js, Node.js, Express, and MongoDB.

![SheyRooms Banner](https://via.placeholder.com/800x200/667eea/ffffff?text=SheyRooms+Hotel+Booking+System)

## ✨ Features

### 🎯 User Features
- **Luxury Landing Page** with animated hero sections
- **User Authentication** (Login/Register) with JWT
- **Advanced Room Search** with filters and availability
- **Interactive Booking System** with date selection
- **User Dashboard** with booking history
- **Responsive Design** for all devices

### 👑 Admin Features
- **Admin Dashboard** with comprehensive analytics
- **Booking Management** with status tracking
- **Room Management** (Add/Edit/Delete rooms)
- **User Management** with role-based access
- **Real-time Data** with automatic updates

### 🔧 Technical Features
- **JWT Authentication** with secure token management
- **MongoDB Integration** with Mongoose ODM
- **RESTful API** with proper error handling
- **Responsive UI** with Ant Design components
- **Modern React** with hooks and functional components

## 🚀 Tech Stack

### Frontend
- **React.js** - UI Library
- **React Router** - Navigation
- **Axios** - HTTP Client
- **Ant Design** - UI Components
- **Framer Motion** - Animations
- **SweetAlert2** - Beautiful alerts

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password Hashing

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### 1. Clone the Repository
git clone https://github.com/yourusername/sheyrooms.git
cd sheyrooms

text

### 2. Install Dependencies

**Backend:**
cd backend
npm install

text

**Frontend:**
cd client
npm install

text

### 3. Environment Setup

Create `.env` file in the backend directory:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sheyrooms
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development

text

### 4. Start the Application

**Backend (Terminal 1):**
cd backend
npm start

text

**Frontend (Terminal 2):**
cd client
npm start

text

The application will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

## 🎯 Usage

### For Users
1. **Browse Rooms** - Explore available accommodations
2. **Register/Login** - Create account or sign in
3. **Book Rooms** - Select dates and make reservations
4. **Manage Bookings** - View and modify your bookings

### For Admins
1. **Admin Login** - Use admin credentials
2. **Dashboard Access** - View comprehensive analytics
3. **Manage Content** - Add/edit rooms and bookings
4. **User Management** - Handle user accounts

## 📱 Screenshots

### Landing Page
![Landing Page](https://via.placeholder.com/600x300/667eea/ffffff?text=Landing+Page)

### Room Booking
![Room Booking](https://via.placeholder.com/600x300/52c41a/ffffff?text=Room+Booking)

### Admin Dashboard
![Admin Dashboard](https://via.placeholder.com/600x300/722ed1/ffffff?text=Admin+Dashboard)

## 🌟 Key Components

### Frontend Structure
client/src/
├── components/
│ ├── ui/
│ └── layout/
├── screens/
│ ├── LandingScreen.jsx
│ ├── LoginScreen.jsx
│ ├── HomeScreen.jsx
│ └── AdminScreen.jsx
├── utils/
│ └── axiosConfig.js
└── App.js

text

### Backend Structure
backend/
├── models/
│ ├── user.js
│ ├── rooms.js
│ └── booking.js
├── routes/
│ ├── usersRoute.js
│ ├── roomsRoute.js
│ └── bookingsRoute.js
├── middleware/
│ └── validation.js
└── server.js

text

## 🔐 Authentication

The system uses JWT (JSON Web Tokens) for authentication:
- Tokens are stored in localStorage
- Automatic token refresh on API calls
- Role-based access control (Admin/User)
- Protected routes with middleware

## 🛠️ API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/verify` - Token verification

### Rooms
- `GET /api/rooms/getallrooms` - Get all rooms
- `POST /api/rooms/addroom` - Add new room (Admin)
- `PUT /api/rooms/:id` - Update room (Admin)

### Bookings
- `POST /api/bookings/bookroom` - Create booking
- `GET /api/bookings/getuserbookings` - Get user bookings
- `GET /api/bookings/getallbookings` - Get all bookings (Admin)

## 🎨 UI/UX Features

- **Modern Design** with gradient backgrounds
- **Smooth Animations** using Framer Motion
- **Responsive Layout** for mobile and desktop
- **Interactive Elements** with hover effects
- **Professional Typography** with optimized fonts

## 🚀 Deployment

### Frontend (Netlify/Vercel)
npm run build

Deploy the build folder
text

### Backend (Heroku/Railway)
Add environment variables
Deploy with your preferred service
text

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/diwansh12)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: diwansh1112@gmail.com

## 🙏 Acknowledgments

- Ant Design for the beautiful UI components
- Framer Motion for smooth animations
- MongoDB for the robust database solution
- The React community for inspiration and support

## 📊 Project Status

🚧 **In Development** - Adding new features and improvements

### Upcoming Features
- [ ] Payment Integration (Stripe/PayPal)
- [ ] Email Notifications
- [ ] Advanced Search Filters
- [ ] Mobile App (React Native)
- [ ] Multi-language Support

---

⭐ **Star this repository if you found it helpful!**
3. Initialize Git and Add to GitHub
Run these commands in your project root:

bash
# Initialize git repository
git init

# Add all files to staging
git add .

# Commit files
git commit -m "Initial commit: SheyRooms hotel booking system

- Complete MERN stack hotel booking application
- User authentication with JWT
- Admin dashboard with booking management
- Responsive design with Ant Design
- Modern animations with Framer Motion
- MongoDB integration with Mongoose
- RESTful API with proper error handling"

# Add your GitHub repository as remote origin
git remote add origin https://github.com/diwansh12/sheyrooms.git

# Push to GitHub
git push -u origin main
4. Create GitHub Repository
Go to GitHub.com

Click "New Repository"

Name it "sheyrooms" or "hotel-booking-system"

Add description: "Modern MERN stack hotel booking system with admin dashboard"

Make it Public (or Private if you prefer)

Don't initialize with README (you already have one)

Click "Create Repository"

5. Additional GitHub Files
Create LICENSE file:
text
MIT License

Copyright (c) 2025 Your Name

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
Create CONTRIBUTING.md:
text
# Contributing to SheyRooms

Thank you for considering contributing to SheyRooms! Here are some guidelines:

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Code Style

- Use ES6+ features
- Follow React best practices
- Use meaningful variable names
- Add comments for complex logic

## Reporting Issues

- Use GitHub issues
- Provide detailed description
- Include steps to reproduce
- Add screenshots if applicable
6. Package.json Scripts
Make sure your package.json files have proper scripts:

Client package.json:

json
{
  "name": "sheyrooms-client",
  "version": "1.0.0",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
Backend package.json:

json
{
  "name": "sheyrooms-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "test": "jest"
  }
}
7. Final Steps
After pushing to GitHub:

Add Topics/Tags: In your GitHub repo settings, add relevant topics like:

react

nodejs

mongodb

hotel-booking

mern-stack

jwt-authentication

Enable GitHub Pages (if you want to demo the frontend)

Add Repository Description: "Modern MERN stack hotel booking system with user authentication, admin dashboard, and responsive design"

Star Your Own Repo to show it's actively maintained