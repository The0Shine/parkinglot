import {
  FaHome,
  FaUser,
  FaCog,
  FaChartBar,
  FaSignOutAlt,
} from "react-icons/fa";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosWarning } from "react-icons/io";
import toast from "react-hot-toast";

const Sidebar = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("/");

  const tabs = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Users", icon: <FaUser />, path: "/users" },
    { name: "Cards", icon: <FaCog />, path: "/cards" },
    { name: "Logs", icon: <FaChartBar />, path: "/logs" },
    { name: "Warnings", icon: <IoIosWarning />, path: "/warnings" },
  ];

  return (
    <div className="h-screen w-60 bg-gray-100 text-gray-900 flex flex-col shadow-lg">
      <div className="p-4 text-2xl font-bold text-center border-b border-gray-300">
        Parking-lot
      </div>
      <nav className="flex-1">
        {tabs.map((tab) => (
          <Link
            key={tab.name}
            to={tab.path}
            onClick={() => setActiveTab(tab.path)}
            className={`flex items-center p-3 transition-all duration-200 hover:text-gray-700 ${
              activeTab === tab.path
                ? "bg-gray-300 text-gray-900 font-semibold"
                : "hover:bg-gray-200"
            }`}
          >
            <span className="text-lg mr-3">{tab.icon}</span>
            <span className="text-sm">{tab.name}</span>
          </Link>
        ))}
        <div
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
            toast.success("Đăng xuất thành công!");
          }}
          className="flex items-center p-3 transition-all duration-200 text-[#747bff] hover:bg-gray-200 hover:text-gray-700 cursor-pointer font-semibold"
        >
          <span className="text-lg mr-3">
            <FaSignOutAlt />
          </span>
          <span className="text-sm">Logout</span>
        </div>
      </nav>
      <footer className="p-4 text-sm text-center border-t border-gray-300">
        ©️ 2024 Horob1
      </footer>
    </div>
  );
};

export default Sidebar;
