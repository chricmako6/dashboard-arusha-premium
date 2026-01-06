"use client";

import { Toaster } from "react-hot-toast";

function ToastProvider({ children }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#0f0f11',
            color: '#fff',
            border: '1px solid #b5a45e',
          },
          success: {
            duration: 4000,
            style: {
              background: '#0f0f11',
              color: '#b5a45e',
              border: '1px solid #b5a45e',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#0f0f11',
              color: '#ef4444',
              border: '1px solid #ef4444',
            },
          },
        }}
      />
    </>
  );
}
export default ToastProvider;