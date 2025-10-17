# Kommyut Admin Dashboard

A comprehensive admin dashboard system for the Kommyut platform with role-based authentication and access control.

## Features

### 🔐 Authentication & Authorization
- **Firebase Authentication** with Google OAuth
- **Role-based Access Control (RBAC)** with custom Firebase claims
- **Four distinct user roles**: User, Developer, Manager, CEO
- **Secure token validation** and middleware protection

### 👨‍💻 Developer Dashboard (`/dev`)
- Real-time system monitoring and performance metrics
- API logs and error tracking
- Database health monitoring
- Push notification control panel
- Sandbox testing environment for APIs

### 🧭 Manager Dashboard (`/manager`)
- Operational analytics and performance metrics
- Interactive charts for route usage and commuter trends
- Revenue per route analysis
- Daily/weekly traffic heatmaps
- Read-only access to operational data

### 💼 CEO Dashboard (`/ceo`)
- Executive overview and key performance indicators
- User growth and engagement trends
- Financial performance summaries
- Strategic business metrics and forecasting
- Simplified, presentation-style visualizations

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React Icons
- **Authentication**: Firebase Auth with custom claims
- **Backend**: Netlify Functions (Serverless)
- **Charts**: Recharts, Chart.js, React-Chartjs-2
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Deployment**: Netlify

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kommyutlogin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

   Fill in your Firebase configuration in `.env`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Deployment

### Netlify Deployment

1. **Connect to Netlify**
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**
   Add these environment variables in Netlify dashboard:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

3. **Firebase Service Account**
   - Place your Firebase service account key as `firebase-service-account-key.json` in the `netlify/functions` folder
   - This file should not be committed to Git (add to .gitignore)

4. **Deploy**
   - Push to your main branch to trigger deployment
   - Netlify Functions will be automatically deployed from the `netlify/functions` folder

## Project Structure

```
kommyutlogin/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common components (LoadingSpinner, etc.)
│   │   └── ui/             # UI component library
│   ├── config/             # Configuration files
│   ├── context/            # React Context providers
│   ├── hooks/              # Custom React hooks
│   ├── pages/              # Dashboard pages
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── netlify/
│   └── functions/          # Serverless API functions
│       ├── index.js        # Main API handler
│       └── package.json    # Functions dependencies
├── dist/                   # Production build output
└── netlify.toml           # Netlify deployment configuration
```

## Security Features

- **HTTPS-only communication**
- **JWT/Firebase token validation**
- **Role-based middleware authentication**
- **2FA required** for Developer and Manager accounts
- **Strict CORS policies**
- **Firebase rules** for data access control

## API Integration

The dashboard uses Netlify Functions for serverless backend functionality:
- Real-time analytics data
- User management and role synchronization
- Route and fare information
- Notification services
- Firebase/Firestore integration for data persistence

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** integration (recommended)

## Deployment

The application is designed to be deployed on **Netlify** and integrates with:
- **Netlify Functions** (for serverless backend API)
- **Firebase Authentication** (for user management)
- **Firebase Firestore** (for data persistence)
- **Custom domain setup**

The serverless architecture provides:
- **Automatic scaling** based on demand
- **Pay-per-use pricing** (only pay for actual usage)
- **Global CDN distribution**
- **Built-in security and monitoring**

## Contributing

1. Follow the existing code structure
2. Maintain TypeScript types
3. Use the established component patterns
4. Test authentication flows thoroughly
5. Follow security best practices

## License

This project is part of the Kommyut platform ecosystem.
