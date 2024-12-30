import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import  instance  from "./../utils/axios";
import toast from "react-hot-toast";
const Login: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();
  const isAuth = useMemo<string>(() => localStorage.getItem("token") || "", []);

  useEffect(() => {
    if (isAuth) {
      navigate("/");
    }
  }, [isAuth, navigate]);

  async function login() {
    try {
      const res = await instance.post("/api/login", {
        username,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/");
      toast.success("Đăng nhập thành công!")
    } catch (error) {
      localStorage.removeItem("token");
      console.error(error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 relative">
      <div className="absolute top-8 right-8">
        <span className="text-white font-bold text-2xl"> @Horob1</span>
      </div>
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
          Đăng nhập
        </h2>
        <div>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="email"
              placeholder="Nhập username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              placeholder="Nhập mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
            onClick={login}
          >
            Đăng Nhập
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
