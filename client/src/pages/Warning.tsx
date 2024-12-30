import { useEffect, useMemo, useState } from "react";
import Table, { ColumnsType } from "rc-table";
import axios from "./../utils/axios";
import { ICard, IWarning } from "../interface";

export const Warning = () => {
  const [warnings, setWarnings] = useState<IWarning[]>([]);
  const [date, setDate] = useState<string | null>(null);
  const [cards, setCards] = useState<ICard[]>([]);
  const columns: ColumnsType<IWarning> = useMemo(
    () => [
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
        title: "Description",
        dataIndex: "desc",
        key: "desc",
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
    [warnings]
  );

  const fetchWarnings = async () => {
    try {
      // Gửi ngày qua body (POST request)
      const response = await axios.post("/api/warnings", { date: date || "" });
      setWarnings(response.data);
    } catch (error) {
      console.error("Error fetching warnings:", error);
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
    fetchWarnings();
    fetchCards();
  }, [date]);

  return (
    <div className="h-screen w-full p-4">
      <div className="mb-4">
        <label className="mr-2">Select Date: </label>
        <input
          type="date"
          value={date || ""}
          onChange={(e) => setDate(e.target.value)} // Cập nhật ngày chọn
        />
      </div>
      <div className="h-[100%] w-full bg-gray-200 rounded-md overflow-y-auto">
        <Table
          rowKey="_id"
          columns={columns}
          data={warnings}
          emptyText={() => (
            <div className="text-center">⚠️ No Warnings Found ⚠️</div>
          )}
        />
      </div>
    </div>
  );
};
