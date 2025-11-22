# VehicleIQ - Apple-Style Vehicle Intelligence Platform

A full-stack web application that provides instant vehicle insights through VIN decoding and license plate lookups, designed with Apple's minimalistic and elegant UI/UX principles.

## Features

### Design
- Apple-inspired minimalistic interface with smooth animations
- Sticky navigation bar with blur effect on scroll
- Hero section with elegant typography and gradients
- Smooth scroll behavior and fade-in animations
- Responsive design across all devices
- Clean white/black theme with subtle transitions

### Functionality
- **VIN Lookup**: Decode 17-character VINs using NHTSA vPIC API
- **License Plate Lookup**: Search by plate number and state
- **Vehicle History**: Placeholder for NMVTIS/VinAudit integration
- Rate limiting protection
- Form validation
- Error handling with user-friendly messages

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **CORS** enabled for cross-origin requests
- **Express Rate Limit** for API protection
- **Axios** for external API calls
- **dotenv** for environment configuration

## Project Structure

```
project/
├── server/
│   ├── index.js                 # Express server entry point
│   ├── routes/
│   │   └── vehicleRoutes.js     # API route definitions
│   ├── controllers/
│   │   └── vehicleController.js # Request handlers
│   └── services/
│       ├── nhtsaService.js      # NHTSA vPIC API integration
│       ├── plateService.js      # Plate lookup (placeholder)
│       └── historyService.js    # Vehicle history (placeholder)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky navigation bar
│   │   ├── Hero.tsx             # Hero section
│   │   ├── LookupSection.tsx    # Search form
│   │   ├── VehicleResults.tsx   # Results display
│   │   └── Footer.tsx           # Footer
│   ├── api/
│   │   └── vehicleApi.ts        # Frontend API client
│   ├── App.tsx                  # Main app component
│   ├── main.tsx                 # React entry point
│   └── index.css                # Global styles
└── .env                         # Environment variables
```

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository and navigate to the project directory

2. Install dependencies:
```bash
npm install
```

3. Environment variables are already configured in `.env`:
```
PORT=3001
```

### Running the Application

The application runs both the Express backend and Vite frontend concurrently:

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:3001`
- Frontend on `http://localhost:5173`

### Running Separately

To run backend only:
```bash
npm run dev:server
```

To run frontend only:
```bash
npm run dev:client
```

### Building for Production

```bash
npm run build
```

## API Endpoints

### POST /api/vehicle

Lookup vehicle information by VIN or license plate.

**Request Body:**
```json
{
  "vin": "1HGBH41JXMN109186"
}
```

OR

```json
{
  "plate": "ABC1234",
  "state": "CA"
}
```

**Response:**
```json
{
  "success": true,
  "vehicle": {
    "vin": "1HGBH41JXMN109186",
    "make": "Honda",
    "model": "Accord",
    "year": "2021",
    ...
  },
  "plate": {
    "plate": "ABC1234",
    "state": "CA",
    ...
  },
  "history": {
    "titleCheck": { "status": "Clean" },
    "accidents": { "reported": 0 },
    ...
  },
  "timestamp": "2025-11-21T10:30:00.000Z"
}
```

## Placeholder Services

The following services return mock data and need to be integrated with real providers:

### License Plate Lookup (`plateService.js`)
Currently returns placeholder data. Integrate with services like:
- Carfax
- AutoCheck
- State DMV APIs

### Vehicle History (`historyService.js`)
Currently returns mock history data. Integrate with:
- NMVTIS (National Motor Vehicle Title Information System)
- VinAudit
- Carfax
- AutoCheck

To integrate, replace the placeholder functions with actual API calls and add your API keys to the `.env` file.

## Rate Limiting

The API implements rate limiting:
- 100 requests per 15 minutes per IP address
- Returns 429 status code when limit exceeded

## Design Philosophy

This application replicates Apple's design language:
- **Typography**: San Francisco font system with precise tracking
- **Spacing**: Generous whitespace and consistent padding
- **Animations**: Smooth, natural transitions with easing functions
- **Colors**: Minimal color palette with subtle gradients
- **Layout**: Clean sections with clear hierarchy
- **Interactions**: Subtle hover states and micro-interactions

## Future Enhancements

- [ ] User authentication
- [ ] Save search history
- [ ] Export reports to PDF
- [ ] Batch VIN lookups
- [ ] Real-time plate lookup integration
- [ ] Vehicle valuation estimates
- [ ] Market analysis and pricing data

## License

Private - All rights reserved
