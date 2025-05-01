import { createListenerMiddleware } from "@reduxjs/toolkit";

// Initialize the listener middleware.
const authErrorListenerMiddleware = createListenerMiddleware();

export default authErrorListenerMiddleware;
