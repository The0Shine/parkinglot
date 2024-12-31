import { useEffect, useMemo, useState } from "react";
import { IUser } from "../interface";
import Table, { ColumnsType } from "rc-table";
import { FaPencilRuler } from "react-icons/fa";
import { BsTrash2 } from "react-icons/bs";
import axios from "./../utils/axios";
import { BiPlus } from "react-icons/bi";

export const User = () => {
  const [users, setUsers] = useState<IUser[]>([]);
  const [isOpenUser, setIsOpenUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [cards, setCards] = useState<{ _id: string; uid: string }[]>([]);
  const [isEditable, setIsEditable] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    cccd: "",
  });
  const [cardIdFormData, setCardIdFormData] = useState("");
  const [cardUidFormData, setCardUidFormData] = useState("");
  const [userIdToDelete, setUserIdToDelete] = useState<string | null>(null);
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const columns: ColumnsType<IUser> = useMemo(
    () => [
      {
        title: "Id",
        dataIndex: "_id",
        key: "_id",
        width: 120,
        render: (value) => (
          <h5 className="font-semibold uppercase">{value.slice(-8)}</h5>
        ),
      },
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
        width: 300,
        render: (value) => (
          <h5 className="font-semibold capitalize">{value}</h5>
        ),
      },
      {
        title: "Phone",
        dataIndex: "phone",
        key: "phone",
        width: 300,
        render: (value) => (
          <h5 className="font-semibold capitalize">{value}</h5>
        ),
      },
      {
        title: "CCCD",
        dataIndex: "cccd",
        key: "cccd",
        width: 300,
        render: (value) => (
          <h5 className="font-semibold capitalize">{value}</h5>
        ),
      },
      {
        title: "CardId",
        dataIndex: "_id",
        key: "_id",
        width: 120,
        render: (value) => {
          const user = users.find((u) => u._id === value);
          const cardUid = user?.cardId?.uid ?? "Không có!";
          return <h5 className="font-semibold uppercase">{cardUid}</h5>;
        },
      },
      {
        title: "Actions",
        dataIndex: "_id",
        key: "_id",
        render: (value) => (
          <div className="flex gap-4">
            <div className="tooltip" data-tip="Edit">
              <button
                onClick={() => {
                  const user = users.find((u) => u._id === value); // Tìm user cần chỉnh sửa
                  setCurrentUser(user || null); // Lưu thông tin user vào state
                  setFormData({
                    name: user?.name ?? "",
                    phone: user?.phone ?? "",
                    cccd: user?.cccd ?? "",
                  });
                  setCardIdFormData(user?.cardId?._id ?? ""); // Cập nhật cardId nếu có
                  setCardUidFormData("");
                  setIsEditable(false);
                  setIsOpenUser(true); // Mở modal
                }}
                className="bg-cyan-500 h-fit w-fit rounded-md p-2 text-base-100"
              >
                <FaPencilRuler />
              </button>
            </div>
            <div className="tooltip" data-tip="Delete">
              <button
                onClick={() => {
                  setUserIdToDelete(value); // Lưu lại ID của người dùng cần xóa
                  setIsOpenDeleteModal(true); // Mở modal xác nhận xóa
                }}
                className="bg-red-500 h-fit w-fit rounded-md p-2 text-base-100"
              >
                <BsTrash2 />
              </button>
            </div>
          </div>
        ),
      },
    ],
    [users]
  );
  const handleAddUser = () => {
    // Reset formData when adding a new card
    setFormData({
      name: "",
      phone: "",
      cccd: "",
    });
    setCurrentUser(null);
    setCardIdFormData(""); // Cập nhật cardId nếu có
    setCardUidFormData("");
    setIsOpenUser(true); // Open modal to add new card
    setIsEditable(false);
  };
  async function fetchUsers() {
    try {
      const response = await axios.get("/api/users");
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function fetchCards() {
    try {
      const response = await axios.get("/api/cards/not-use");
      setCards(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleSaveUser() {
    if (currentUser) {
      console.log();
      if (formData) {
        const usersaved = await axios.put(
          `/api/users/${currentUser._id}`,
          formData
        );
        const usersavedId = usersaved.data._id;
        if (isEditable && cardIdFormData) {
          await axios.patch(`/api/users/${usersavedId}`, {
            cardId: cardIdFormData,
          });
          fetchCards();
        }
        fetchUsers(); // Tải lại danh sách người dùng
      }
      setCardIdFormData("");

      setIsOpenUser(false);
    } else {
      try {
        const usersaved = await axios.post("/api/users", formData);
        const usersavedId = usersaved.data._id;
        setIsOpenUser(false);
        setFormData({ name: "", phone: "", cccd: "" });
        if (cardIdFormData) {
          await axios.patch(`/api/users/${usersavedId}`, {
            cardId: cardIdFormData,
          });
        }
        fetchUsers(); // Refresh users list
        fetchCards();
        setCardIdFormData("");
      } catch (error) {
        console.error(error);
      }
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchCards();
  }, []);

  return (
    <div className="h-screen w-full p-4 relative">
      <div className="h-[100%] w-full bg-gray-200 rounded-md overflow-y-auto">
        <Table
          rowKey="_id"
          columns={columns}
          data={users}
          emptyText={() => (
            <div className="text-center">⚠️ No Data Found ⚠️</div>
          )}
        />
      </div>
      <div className="absolute bottom-16 right-16">
        <button
          onClick={handleAddUser}
          className="h-fit w-fit rounded-full bg-gradient-to-tr from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% p-2 text-base-300 hover:opacity-75"
        >
          <BiPlus />
        </button>
      </div>

      {isOpenUser && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">
              {currentUser ? "Edit User" : "Add New User"}
            </h3>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Name</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">Phone</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">CCCD</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.cccd}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cccd: e.target.value }))
                }
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center mb-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isEditable}
                    onChange={() => setIsEditable((prev) => !prev)} // Toggle trạng thái
                  />
                  <div
                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer
            peer-checked:bg-blue-500 peer-checked:after:translate-x-6 after:content-[''] 
            after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full 
            after:h-4 after:w-4 after:transition-all"
                  ></div>
                </label>
              </div>

              <label className="block mb-2 font-medium">CardId</label>
              {/* Dropdown chọn CardUID */}
              <select
                className={`w-full p-2 border rounded ${
                  !isEditable ? "bg-gray-200" : ""
                }`}
                value={cardUidFormData || ""}
                onChange={(e) => {
                  if (isEditable) {
                    const selectedOption = e.target.selectedOptions[0];
                    setCardIdFormData(
                      selectedOption.getAttribute("data-cardid") || ""
                    );
                    setCardUidFormData(
                      selectedOption.getAttribute("data-carduid") || ""
                    );
                  }
                }}
                disabled={!isEditable} // Vô hiệu hóa khi chưa bật chỉnh sửa
              >
                <option value="" disabled>
                  Select a card
                </option>
                {cards.map((card) => (
                  <option
                    key={card._id}
                    value={card.uid}
                    data-cardid={card._id}
                    data-carduid={card.uid}
                  >
                    {card.uid}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsOpenUser(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {currentUser ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      {isOpenDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <div className="mb-4">
              <p>Bạn có chắc chắn muốn xóa người dùng này không?</p>
            </div>
            <div className="flex justify-between gap-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setIsOpenDeleteModal(false)}
              >
                Hủy
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded"
                onClick={async () => {
                  if (userIdToDelete) {
                    await axios.delete(`/api/users/${userIdToDelete}`);
                    fetchUsers();
                    fetchCards();
                    setIsOpenDeleteModal(false);
                  }
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
