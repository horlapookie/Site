import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register ProPush service worker for push notifications
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-check-permissions-85542.js')
      .then((registration) => {
        console.log('ProPush service worker registered successfully:', registration.scope);
      })
      .catch((error) => {
        console.error('ProPush service worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
