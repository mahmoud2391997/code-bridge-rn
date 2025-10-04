# QR & Barcode Scanner - Web Application

A modern web-based QR code and barcode scanner built with React, TypeScript, and Vite.

## Features

- 📱 Web-based barcode/QR code scanning using device camera
- 🎨 Modern UI with shadcn/ui components
- 📊 Scan history tracking
- 🌙 Dark/light theme support
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Building for Production

```sh
# Build the application
npm run build

# Preview the production build
npm run preview
```

## Technologies Used

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful and accessible UI components
- **ZXing** - Web-based barcode scanning library
- **React Router** - Client-side routing
- **Lucide React** - Beautiful icons

## Browser Compatibility

This application requires:
- Modern browsers with camera access support
- HTTPS connection for camera permissions (in production)
- WebRTC support for video streaming

## Deployment

The application can be deployed to any static hosting service:

- **Vercel**: Connect your GitHub repo for automatic deployments
- **Netlify**: Drag and drop the `dist` folder after building
- **GitHub Pages**: Use GitHub Actions for automated deployment
- **AWS S3 + CloudFront**: For scalable static hosting

## Camera Permissions

The app requires camera access to scan barcodes. Make sure to:
- Serve the app over HTTPS in production
- Grant camera permissions when prompted
- Ensure your device has a working camera

## License

MIT License - feel free to use this project for your own purposes.