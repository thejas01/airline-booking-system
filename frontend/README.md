# User Service Frontend

A React-based frontend application for the User Service authentication system.

## Features

- User registration and login
- JWT-based authentication with refresh tokens
- Protected routes and navigation
- User dashboard with profile information
- Account deletion functionality
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18+ and npm
- User Service backend running on port 9091
- PostgreSQL database (for the backend)

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

The application will run on http://localhost:5173

## Backend Requirements

Make sure the User Service backend is running on http://localhost:9091 with:
- PostgreSQL database on port 5432
- Database named "flight_app"

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/             # API configuration and endpoints
├── components/      # Reusable components
├── contexts/        # React contexts (Auth)
├── pages/           # Page components
├── types/           # TypeScript types
├── utils/           # Utility functions
├── App.tsx          # Main app component
└── main.tsx         # Application entry point
```

## Technologies Used

- React 19
- TypeScript
- Vite
- React Router v6
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons
- TanStack Query for state management