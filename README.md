# MiWebCafe Next Frontend

Next.js frontend for the MiWebCafe system.

This application consumes the MiWebCafe REST API and provides a modern UI alternative to the Angular client.

---

## Live Demo

Production deployment:

https://miwebcafe-next-frontend.vercel.app

---

## Features

- JWT authentication
- Role-based access control (Admin / Cashier)
- Cash register management (open / close)
- Sales registration (cart + confirm sale)
- Role-based navigation
- Responsive layout

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Fetch API
- JWT-based authentication
- Vercel deployment

---

## Running Locally

1. Install dependencies: npm install


2. Start development server: npm run dev

App runs at: http://localhost:3000

---

## Backend Dependency

This frontend requires the MiWebCafe API backend:

https://github.com/oscar-chinchin-dev/miwebcafe-api

Make sure the backend is running before logging in.

---

## Architecture Notes

- Uses App Router structure
- Role-based rendering logic
- Client-side token storage
- Clean separation between UI and API layer

---

## Related Repositories

- Angular Frontend:
  https://github.com/oscar-chinchin-dev/Webcafe-System

- Backend API:
  https://github.com/oscar-chinchin-dev/miwebcafe-api

---

## Future Improvements

- Global state management
- API environment configuration
- Cloud backend integration
- UI enhancements

---

## Author

Oscar Chinchin
 

