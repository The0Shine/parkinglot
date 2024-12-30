import { Outlet, useNavigate } from "react-router-dom";
// import { Toaster } from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import { useEffect, useMemo } from "react";

function App() {
  const navigate = useNavigate();
  const isAuthenticated = useMemo(
    () => localStorage.getItem("token") !== null,
    []
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <div className="flex w-full">
        <Sidebar />
        <Outlet />
      </div>

      {/* <Toaster position="top-center" reverseOrder={false} /> */}
    </>
  );
}

export default App;
