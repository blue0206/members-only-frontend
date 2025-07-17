# Members Only - Frontend

![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?style=for-the-badge&logo=vite)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-7B52AB?style=for-the-badge&logo=redux)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss)

This repository contains the frontend source code for the **Members Only** application, a modern clubhouse-style message board. It's a fully-featured Single-Page Application (SPA) built with React and a modern toolchain, designed to communicate with a serverless microservice backend.

**Live Application:** **[cloud.nevery.shop](https://cloud.nevery.shop)**  
**Backend Repository:** [Members Only Backend Microservice](https://github.com/blue0206/members-only-backend)  
**Backend API Documentation:** [@blue0206/members-only-shared-types](https://github.com/blue0206/members-only-shared-types)

---

## Table of Contents

- [Members Only - Frontend](#members-only---frontend)
  - [Table of Contents](#table-of-contents)
  - [Overview \& Key Features](#overview--key-features)
  - [Tech Stack \& Architectural Decisions](#tech-stack--architectural-decisions)
  - [Project Structure](#project-structure)
  - [Deployment](#deployment)

---

## Overview & Key Features

This frontend provides a seamless and responsive user experience, featuring:

- **Robust Authentication Flow:** Secure login, registration, and session management with automatic token refresh handling. The UI is protected and state persists across browser reloads.
- **Role-Based UI:** The user interface dynamically adapts based on the authenticated user's role (`USER`, `MEMBER`, `ADMIN`), conditionally rendering elements like message author details or administrative controls.
- **Live Message Board:** A central message feed that establishes a persistent **Server-Sent Events (SSE)** connection to a dedicated real-time server. New messages and updates are pushed instantly to all connected clients without the need for polling or web sockets.
- **Markdown Support:** Users can compose messages using Markdown syntax. A custom component using `react-markdown` and `react-syntax-highlighter` renders the content beautifully, including full syntax highlighting for code blocks.
- **Client-Side Error Handling:** A custom `useApiErrorHandler` hook provides a centralized way to interpret API errors.
- **Responsive Design:** Built with Tailwind CSS, the layout is fully responsive and optimized for both desktop and mobile devices, leveraging the `shadcn/ui` component library for a clean and modern aesthetic.

---

## Tech Stack & Architectural Decisions

| Category             | Technology / Pattern                      | Rationale                                                                                                                                                                                                                           |
| :------------------- | :---------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**        | **React & Vite**                          | Extremely fast development experience.                                                                                                                                                                                              |
| **Language**         | **TypeScript**                            | For end-to-end type safety.                                                                                                                                                                                                         |
| **State Management** | **Redux Toolkit (RTK)**                   | A simple, powerful, and scalable state management solution.                                                                                                                                                                         |
| **Data Fetching**    | **RTK Query**                             | A powerful data fetching and caching layer built on top of Redux Toolkit.                                                                                                                                                           |
| **Real-Time Data**   | Native EventSource API                    | For Server-Sent Events, the browser's native EventSource API is used directly to establish a persistent connection to the dedicated SSE server. Event handlers dispatch Redux actions to update state or invalidate RTK Query tags. |
| **Token Refresh**    | **`baseQueryWithReauth`**                 | A custom RTK Query `baseQuery` is implemented to automatically handle JWT access token expiration. It seamlessly intercepts failed requests, calls the token refresh endpoint, and retries the original request upon success.       |
| **Styling**          | **Tailwind CSS** & **`shadcn/ui`**        | Utility-first CSS framework complemented by the components from `shadcn/ui`.                                                                                                                                                        |
| **Type Sharing**     | **`@blue0206/members-only-shared-types`** | Consumes a dedicated npm package to share DTOs, Zod schemas, and type definitions with the backend, ensuring a consistent API contract.                                                                                             |
| **Analytics**        | Vercel Analytics and Speed Insights       | Integrated for tracking website speed and smoothness, and user behavior and engagement metrics like page views.                                                                                                                     |

---

## Project Structure

```
.
├── src/
│   ├── app/                 # Application-wide logic and configuration
│   │   ├── services/        # Core API services and endpoints (authApi, messageApi, base query, re-auth logic)
│   │   └── store.ts         # Redux store configuration
│   ├── components/
│   │   ├── layout/          # Layout components and providers (Header, LoginBanner, etc.)
│   │   ├── shared/          # Shared application components (ScrollButtons, ErrorPage, etc.)
│   │   ├── skeleton/        # Skeleton loader components (MessageSkeleton, SessionSkeleton, etc.)
│   │   └── ui/              # Auto-generated shadcn/ui components
│   ├── features/            # Feature-specific modules (the core of the app)
│   │   ├── auth/            # Authentication feature (login, register)
│   │   │   ├── Login.tsx    # React component.
│   │   │   └── authSlice.ts # Redux slice for authentication state
│   │   ├── messages/        # Messages feature
│   │   ├── notifications/   # UI toast notification feature
│   │   ├── sse/             # Server-Sent Events handling
│   │   ├── ui/              # UI-specific state (e.g., theme)
│   │   └── user/            # User management and profile feature
│   ├── hooks/               # Global, reusable React hooks
│   ├── lib/                 # Constants and third-party library configurations
│   ├── pages/               # Top-level page components (HomePage, BookmarksPage)
│   ├── routes/              # Routing configuration and protected routes
│   ├── types/               # Global TypeScript definitions, enums, and type guards
│   ├── utils/               # Global utility functions (date formatting, etc.)
│   ├── App.tsx              # Main application component with providers and layout
│   └── main.tsx             # Application entry point
├── index.html               # Main HTML file for Vite
├── package.json             # Project dependencies and scripts
└── .env.example             # Example environment variables

```

---

## Deployment

The frontend is a static single-page application built using Vite, deployed on Vercel.

---

_This project was built by Aayush Rai (blue0206)._
