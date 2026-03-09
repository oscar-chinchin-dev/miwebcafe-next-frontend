# MiWebCafe Next Frontend

Next.js frontend for the MiWebCafe point-of-sale system.

This application consumes the MiWebCafe REST API and provides a modern UI alternative to the Angular client.
---

## Live Demo

Production deployment:

https://miwebcafe-next-frontend.vercel.app

Note:
The backend API is hosted on an Azure free trial.
After the trial expires, the live demo may stop working.

---

## Features

-JWT authentication
-Role-based access control (Admin / Cashier)
-Cash register management (open / close)
-Sales registration (cart + confirm sale)
-Sales reporting (daily and date range)
-Product and category management
-Role-based navigation
-Responsive layout

---

## Screenshots

Login
Cash Register
Sales Panel
Reports
Product Management

---

## Tech Stack

Frontend:

-Next.js (App Router)
-TypeScript
-Fetch API

Authentication:
-JWT-based authentication
-Role-based authorization

Deployment:
-Vercel

Backend:
-.NET Web API
-Microsoft SQL Server

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
 

