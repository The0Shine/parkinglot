import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./Layout/App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { SocketProvider, UseSocket } from "./Socket.tsx";
import { LoginLayout } from "./Layout/LoginLayout.tsx";
import Login from "./pages/Login.tsx";
import { Home } from "./pages/Home.tsx";
import { User } from "./pages/User.tsx";
import { Card } from "./pages/Card.tsx";
import { Log } from "./pages/Log.tsx";
import { Warning } from "./pages/Warning.tsx";
import toast, { Toaster } from "react-hot-toast";
import { IWarning } from "./interface.ts";

const AppWrapper = () => {
  const { socket } = UseSocket();

  const handleWarning = (warning: IWarning) => {
    toast.error("Cảnh báo! " + warning.desc);
  };

  useEffect(() => {
    if (socket) {
      socket.on("warning", handleWarning);

      // Cleanup on component unmount
      return () => {
        socket.off("warning", handleWarning);
      };
    }
  }, [socket]);

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <RouterProvider router={router} />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <Home />,
      },
      {
        path: "users",
        element: <User />,
      },
      {
        path: "cards",
        element: <Card />,
      },
      {
        path: "logs",
        element: <Log />,
      },
      {
        path: "warnings",
        element: <Warning />,
      },
    ],
  },
  {
    path: "/login",
    element: <LoginLayout />,
    children: [
      {
        path: "",
        element: <Login />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SocketProvider>
      <AppWrapper />
    </SocketProvider>
  </StrictMode>
);
