import { useEffect, useMemo } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export const LoginLayout = () => {
  const navigate = useNavigate();
  const isAuthenticated = useMemo(
    () => localStorage.getItem("token") !== null,
    []
  );

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  return (
    <>
      <Outlet />
    </>
  );
};
