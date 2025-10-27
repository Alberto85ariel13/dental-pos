# DentalPro POS - React Web Application

A modern, responsive Point of Sale system for dental clinics with OpenDental integration.

## Features

✅ **Patient Search** - Real-time search by name, phone, or patient ID
✅ **Checkout System** - Add dental procedures and process payments
✅ **Appointments** - View daily schedule from OpenDental
✅ **Settings** - Configure OpenDental API credentials
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices
✅ **iPad Optimized** - Touch-friendly interface for iPad POS terminals

## Tech Stack

- **React 18** - UI framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Vite** - Build tool and development server
- **CSS3** - Modern styling with gradients and animations

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Deploy to Your Server

```bash
# Build the application
npm run build

# The 'dist' folder contains all static files
# Upload the contents of 'dist' to your web server
```

## Server Deployment

### Option 1: Static Web Server (Nginx, Apache)

1. Build the application:
   ```bash
   npm run build
   ```

2. Copy the `dist` folder contents to your web server:
   ```bash
   # Example for Nginx
   cp -r dist/* /var/www/html/dental-pos/
   ```

3. Configure your web server:

   **Nginx Configuration:**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html/dental-pos;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

   **Apache Configuration (.htaccess):**
   ```apache
   RewriteEngine On
   RewriteBase /
   RewriteRule ^index\.html$ - [L]
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   RewriteRule . /index.html [L]
   ```

### Option 2: Node.js Server

1. Install serve package:
   ```bash
   npm install -g serve
   ```

2. Serve the built application:
   ```bash
   npm run build
   serve -s dist -p 3000
   ```

### Option 3: Docker

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:
```bash
docker build -t dental-pos .
docker run -p 80:80 dental-pos
```

## Project Structure

```
dental-pos-react/
├── src/
│   ├── pages/
│   │   ├── Checkout.jsx       # Checkout page
│   │   ├── PatientSearch.jsx  # Patient search
│   │   ├── Appointments.jsx   # Appointments view
│   │   └── Settings.jsx       # Settings page
│   ├── services/
│   │   └── OpenDentalService.js  # API service layer
│   ├── App.jsx                # Main app component
│   ├── App.css                # App styles
│   ├── main.jsx               # React entry point
│   └── index.css              # Global styles
├── index.html                 # HTML template
├── vite.config.js            # Vite configuration
├── package.json              # Dependencies
└── README.md                 # This file
```

## Configuration

### OpenDental API Setup

1. Open the application in your browser
2. Navigate to Settings (⚙️)
3. Enter your OpenDental server URL
4. Enter your API key
5. Click "Test Connection"
6. Click "Save Settings"

Settings are stored in browser's localStorage.

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://your-opendental-server.com/api
VITE_API_KEY=your-api-key
```

## API Integration

The application uses OpenDental API endpoints:

- `GET /api/patients/search` - Search patients
- `GET /api/patients/{id}` - Get patient details
- `GET /api/appointments` - Get appointments
- `POST /api/appointments` - Schedule appointment
- `GET /api/procedures` - Get procedure codes

### Mock Data

The application includes mock data for testing:
- 4 sample patients
- 4 sample appointments
- 13 dental procedure codes

To use real OpenDental data, configure the API settings in the Settings page.

## Customization

### Change Colors

Edit the gradient colors in CSS files:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add More Procedures

Edit `src/services/OpenDentalService.js`:
```javascript
async getProcedureCodes() {
  return [
    { code: 'D1234', description: 'Your Procedure', fee: 100 },
    // Add more...
  ];
}
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Security

- API credentials stored in localStorage
- HTTPS recommended for production
- CORS must be configured on OpenDental server
- Consider using authentication middleware

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### API Connection Issues

- Verify OpenDental server URL is correct
- Check API key is valid
- Ensure CORS is enabled on OpenDental server
- Check network connectivity

### Routing Issues

If routes don't work after deployment, ensure your web server is configured to serve `index.html` for all routes (see deployment configurations above).

## Performance

- Lazy loading for routes
- Optimized production build with Vite
- Minified CSS and JavaScript
- Tree-shaking for smaller bundle size

## License

Copyright © 2025 DentalPro. All rights reserved.

## Support

For issues and questions:
- Check OpenDental API documentation
- Review React and Vite documentation
- Contact support@dentalpro.com
