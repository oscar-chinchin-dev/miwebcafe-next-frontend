# MiWebCafe Next Frontend

Next.js frontend for the MiWebCafe system.

## Features
- JWT login + role-based access (Admin / Cajero)
- Caja: open, current status, close
- Ventas: product list, cart, register sale
- Navbar + layout with role-based navigation

## Tech Stack
- Next.js (App Router) + TypeScript
- Fetch API
- ASP.NET Core Web API (separate backend)

## Running locally
1. Start the backend API (ASP.NET Core) on:
   - https://localhost:7107
2. Start the frontend:

npm install
npm run dev

This repository deploys only the frontend. The backend API is not deployed and must be running locally for full functionality.
