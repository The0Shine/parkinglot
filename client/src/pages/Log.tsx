import { useEffect, useMemo, useState } from "react";
import Table, { ColumnsType } from "rc-table";
import axios from "./../utils/axios";
import { ICard, ILog } from "../interface";
import { IoDownloadOutline } from "react-icons/io5";
import * as XLSX from "xlsx";

export const Log = () => {
  const [logs, setLogs] = useState<ILog[]>([]);
  const [date, setDate] = useState<string>("");
  const [cards, setCards] = useState<ICard[]>([]);
  const handleDownload = () => {
    // Dữ liệu mẫu
    if (logs.length === 0) {
      alert("No data available to download.");
      return;
    }

    // Chuyển đổi dữ liệu thành sheet
    const worksheet = XLSX.utils.json_to_sheet(logs);

    // Tạo workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

    // Xuất file Excel
    XLSX.writeFile(workbook, "data.xlsx");
  };

  const columns: ColumnsType<ILog> = useMemo(
    () => [
      {
        title: "Bill",
        dataIndex: "bill",
        key: "bill",
        render: (value) => (
          <h5 className="font-semibold">{value.toLocaleString()} VND</h5>
        ),
      },
      {
        title: "Paid",
        dataIndex: "paid",
        key: "paid",
        render: (value) => (
          <h5
            className={`font-semibold ${
              value ? "text-green-500" : "text-red-500"
            }`}
          >
            {value ? "Paid" : "Unpaid"}
          </h5>
        ),
      },
      {
        title: "Card UID",
        dataIndex: "cardId",
        key: "cardId",
        render: (value) => {
          const card = cards.find((u) => u._id === value);
          console.log(card);

          const cardUid = card?.uid ?? "Không có!";
          return <h5 className="font-semibold uppercase">{cardUid}</h5>;
        },
      },
      {
        title: "userId",
        dataIndex: "userId",
        key: "userId",
        render: (value) => (
          <h5 className="font-semibold capitalize">{value}</h5>
        ),
      },
      {
        title: "License Plate",
        dataIndex: "licensePlate",
        key: "licensePlate",
        render: (value) => <h5 className="font-semibold">{value}</h5>,
      },
      {
        title: "Created At",
        dataIndex: "createdAt",
        key: "createdAt",
        render: (value) => (
          <h5 className="font-semibold">{new Date(value).toLocaleString()}</h5>
        ),
      },
    ],
    [logs]
  );

  const fetchLogs = async () => {
    try {
      // Gửi ngày qua body (POST request)
      const response = await axios.post("/api/logs", { date: date || "" });
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching log:", error);
    }
  };
  const fetchCards = async () => {
    try {
      const response = await axios.get("/api/cards");
      setCards(response.data);
      console.log(1);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };
  // Đảm bảo tự động gọi fetch khi thay đổi ngày
  useEffect(() => {
    fetchLogs();
    fetchCards();
  }, [date]);

  return (
    <div className="h-screen w-full p-4">
      <div className="mb-4">
        <label className="mr-2">Select Date: </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)} // Cập nhật ngày chọn
        />
      </div>
      <div className="h-[100%] w-full bg-gray-200 rounded-md overflow-y-auto">
        <Table
          rowKey="_id"
          columns={columns}
          data={logs}
          emptyText={() => (
            <div className="text-center">⚠️ No Logs Found ⚠️</div>
          )}
        />
      </div>
      <div className="absolute bottom-16 right-16">
        <button
          onClick={() => {
            handleDownload();
          }}
          className="h-fit w-fit rounded-full bg-gradient-to-tr from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% p-2 text-base-300 hover:opacity-75"
        >
          <IoDownloadOutline />
        </button>
      </div>
    </div>
  );
};
