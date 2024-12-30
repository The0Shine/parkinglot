import { useEffect, useState } from "react";
import { Card } from "../components/Card";
import instance from "./../utils/axios";
import { ILog, ISlot } from "../interface";
import { UseSocket } from "../Socket";
export const Home = () => {
  const [isInGateOpen, setInGateOpen] = useState<boolean>(false);
  const [isOutGateOpen, setOutGateOpen] = useState<boolean>(false);
  const [slots, setSlots] = useState<ISlot[]>([]);
  const [logs, setLogs] = useState<ILog[]>([]);
  const { socket } = UseSocket();
  const handleOpenGateIn = () => {
    console.log("Setting isInGateOpen to true");
    setInGateOpen(true);
  };
  const handleCloseGateIn = () => {
    console.log("Setting isInGateOpen to false");
    setInGateOpen(false);
  };
  const handleOpenGateOut = () => setOutGateOpen(true);
  const handleCloseGateOut = () => setOutGateOpen(false);
  const handleUpdateSlot = () => {
    fetchSlots();
  };
  const handleNewLog = () => {
    fetchLogs();
  };
  async function fetchSlots() {
    try {
      const response = await instance.get("/api/slots");
      setSlots(response.data);
    } catch (e) {
      console.error("Error fetching slots", e);
    }
  }

  async function fetchLogs() {
    try {
      const response = await instance.get("/api/car");
      setLogs(response.data);
    } catch (e) {
      console.error("Error fetching logs", e);
    }
  }

  console.log(isInGateOpen);
  useEffect(() => {
    if (socket) {
      socket.on("open-gate-in", handleOpenGateIn);
      socket.on("close-gate-in", handleCloseGateIn);
      socket.on("open-gate-out", handleOpenGateOut);
      socket.on("close-gate-out", handleCloseGateOut);
      socket.on("update-slot-ui", handleUpdateSlot);
      socket.on("new-log", handleNewLog);
      return () => {
        socket.off("open-gate-in", handleOpenGateIn);
        socket.off("close-gate-in", handleCloseGateIn);
        socket.off("open-gate-out", handleOpenGateOut);
        socket.off("close-gate-out", handleCloseGateOut);
        socket.off("update-slot-ui", handleUpdateSlot);
        socket.off("new-log", handleNewLog);
      };
    }
  }, [socket]);

  useEffect(() => {
    const fetchAll = async () => {
      await Promise.all([fetchSlots(), fetchLogs()]);
    };
    fetchAll();
  }, []);

  return (
    <div className="h-screen w-full p-4 grid grid-cols-12 gap-4">
      <div className="col-span-9">
        <div className="bg-gray-100 h-[100%] overflow-y-auto rounded-md p-4 grid grid-cols-12 gap-4">
          <div
            className={`h-6 col-span-6 rounded-l-2xl ${
              isInGateOpen ? "bg-green-600" : "bg-red-600"
            }`}
          ></div>
          <div
            className={`h-6 col-span-6 rounded-r-2xl ${
              isOutGateOpen ? "bg-green-600" : "bg-red-600"
            }`}
          ></div>
          {slots.map((item) => (
            <div key={item._id} className="col-span-3">
              <Card
                name={item.number.toString()}
                key={item._id}
                empty={item.empty}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-3 grid">
        <div className="bg-gradient-to-br from-blue-100 to-blue-300 p-10 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Xe trong bãi
          </h1>

          {/* Queue container */}
          <div className="w-full max-w-2xl bg-white shadow-lg rounded-lg p-6">
            {logs.map((item, index) => (
              <div
                key={item._id}
                className="flex justify-between items-center p-4 mb-3 rounded-md shadow-md transition-transform transform hover:scale-105"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-blue-400 text-white rounded-full flex items-center justify-center font-semibold shadow">
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-medium">{item.licensePlate}</p>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-center p-6">
                <p>Không có xe nào trong bãi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
