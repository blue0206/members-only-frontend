# Members Only - Frontend

[![Vercel Deployment](https://vercel.com/button)](https://app.nevery.shop)

This repository contains the frontend code for **Members Only**, a real-time discussion platform built with modern web technologies. This application serves as a comprehensive showcase of a feature-rich, secure, and performant single-page application (SPA).

The live version of this branch can be found here: **[https://app.nevery.shop](https://app.nevery.shop)**

> **Note:** This repository represents the frontend for the monolithic deployment of the application. The ongoing development for a refactored serverless architecture is taking place on the `main` branch of the project repositories.

---

## 🚀 Features

- **Secure Authentication:** Robust JWT-based authentication flow with Access and Refresh Tokens.
- **Cookie-Based Session Management:** Secure `HttpOnly` cookies for refresh tokens to prevent XSS attacks.
- **CSRF Protection:** Implemented the Double Submit Cookie pattern to protect against Cross-Site Request Forgery on state-changing actions.
- **Role-Based Access Control (RBAC):** UI and data visibility dynamically change based on user roles (Admin, Member, User).
- **Real-time Event Handling (SSE):** Uses Server-Sent Events to receive real-time signals from the backend, triggering automatic data refetches for a live user experience (e.g., new messages, profile updates).
- **Message Board:** Users can create messages (with Markdown support), view a live message feed, and interact with posts.
- **Avatar Uploads:** Seamless image upload functionality integrated with Cloudinary for image processing and storage.
- **Session Management:** Users can view and revoke their active sessions from a dedicated settings page.
- **Dark Mode & Theming:** A persistent, system-aware dark mode built with Tailwind CSS and Shadcn.
- **Advanced State Management:** Utilizes Redux Toolkit and RTK Query for efficient server state caching, invalidation, and a seamless re-authentication flow.
- **Robust Error Handling:** Integrated with Sentry for real-time error reporting, with user-friendly toast notifications for API and client-side errors.

---

## 🛠️ Tech Stack

- **Framework:** React 19 with Vite
- **Language:** TypeScript
- **State Management:** Redux Toolkit (RTK) & RTK Query
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Routing:** React Router v7
- **Form Management:** React Hook Form with Zod for schema validation
- **Linting & Formatting:** ESLint & Prettier
- **Error Reporting:** Sentry

---

## Running Locally

To run the frontend locally, you will need the backend server running simultaneously. The easiest way to run the entire stack is by using the central Docker Compose setup located in the [`members-only-docker-compose`](https://github.com/blue0206/members-only-docker-compose) repository.

---

## Deployment

This branch is deployed to **Vercel**.
