import { useEffect, useMemo, useState } from "react";
import Table, { ColumnsType } from "rc-table";
import axios from "./../utils/axios";
import { BiPlus } from "react-icons/bi";
import { ICard } from "../interface";
import { FaPencilRuler } from "react-icons/fa";
import { BsTrash2 } from "react-icons/bs";
import toast from "react-hot-toast";
import { AxiosError } from "axios";

export const Card = () => {
  const [cards, setCards] = useState<ICard[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState<{
    type: string;
    uid: string;
    _id?: string;
  }>({
    type: "normal",
    uid: "",
  });

  const columns: ColumnsType<ICard> = useMemo(
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
        title: "Type",
        dataIndex: "type",
        key: "type",
        render: (value) => (
          <h5 className="font-semibold capitalize">{value || "N/A"}</h5>
        ),
      },
      {
        title: "UID",
        dataIndex: "uid",
        key: "uid",
        render: (value) => (
          <h5 className="font-semibold uppercase">{value || "N/A"}</h5>
        ),
      },

      {
        title: "Actions",
        dataIndex: "_id",
        key: "_id",
        render: (value) => (
          <div className="flex gap-4">
            <div className="tooltip" data-tip="Edit">
              <button
                onClick={() => handleEditCard(value)}
                className="bg-cyan-500 h-fit w-fit rounded-md p-2 text-base-100"
              >
                <FaPencilRuler />
              </button>
            </div>
            <div className="tooltip" data-tip="Delete">
              <button
                onClick={() => handleDeleteCard(value)} // Mở modal xác nhận xóa
                className="bg-red-500 h-fit w-fit rounded-md p-2 text-base-100"
              >
                <BsTrash2 />
              </button>
            </div>
          </div>
        ),
      },
    ],
    [cards]
  );

  const fetchCards = async () => {
    try {
      const response = await axios.get("/api/cards");
      setCards(response.data);
      console.log(1);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };
  useEffect(() => {
    fetchCards();
  }, []);
  const handleAddCard = () => {
    // Reset formData when adding a new card
    setFormData({ type: "normal", uid: "" });
    setIsModalOpen(true); // Open modal to add new card
  };

  const handleAddCardAPI = async () => {
    try {
      const response = await axios.post("/api/cards", formData);
      setCards((prev) => [...prev, response.data]);
      setIsModalOpen(false);
      setFormData({ type: "normal", uid: "" });
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response) {
        const errorMessage = error.response.data?.message || "Đã xảy ra lỗi!";
        toast.error(errorMessage);
      } else {
        toast.error("Lỗi không xác định!");
      }
    }
  };

  const handleEditCard = (id: string) => {
    const cardToEdit = cards.find((card) => card._id === id);
    if (cardToEdit) {
      setFormData({
        type: cardToEdit.type,
        uid: cardToEdit.uid,
        _id: cardToEdit._id,
      });
      setIsModalOpen(true); // Open modal for editing
    }
  };

  const handleSaveCard = async () => {
    if (formData._id) {
      // Update existing card
      try {
        const response = await axios.put(
          `/api/cards/${formData._id}`,
          formData
        );
        setCards((prev) =>
          prev.map((card) => (card._id === formData._id ? response.data : card))
        );
        setIsModalOpen(false);
        setFormData({ type: "normal", uid: "" });
      } catch (error: unknown) {
        if (error instanceof AxiosError && error.response) {
          const errorMessage = error.response.data?.message || "Đã xảy ra lỗi!";
          toast.error(errorMessage);
        } else {
          toast.error("Lỗi không xác định!");
        }
      }
    } else {
      // Add new card
      handleAddCardAPI();
    }
  };

  const handleDeleteCard = (id: string) => {
    setCardToDelete(id); // Lưu ID của card cần xóa
    setIsDeleteModalOpen(true); // Mở modal xác nhận
  };
  const handleConfirmDelete = async () => {
    if (!cardToDelete) return;
    try {
      await axios.delete(`/api/cards/${cardToDelete}`);
      setCards((prev) => prev.filter((card) => card._id !== cardToDelete));
      setIsDeleteModalOpen(false);
      setCardToDelete(null);
    } catch (error) {
      console.error("Error deleting card:", error);
    }
  };
  return (
    <div className="h-screen w-full p-4 relative">
      <div className="h-[100%] w-full bg-gray-200 rounded-md overflow-y-auto">
        <Table
          rowKey="_id"
          columns={columns}
          data={cards}
          emptyText={() => (
            <div className="text-center">⚠️ No Cards Found ⚠️</div>
          )}
        />
      </div>
      <div className="absolute bottom-16 right-16">
        <button
          onClick={handleAddCard} // Call handleAddCard to reset formData and open modal
          className="h-fit w-fit rounded-full bg-gradient-to-tr from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90% p-2 text-base-300 hover:opacity-75"
        >
          <BiPlus />
        </button>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">
              {formData._id ? "Edit Card" : "Add New Card"}
            </h3>

            {/* Hiển thị ID nhưng không cho chỉnh sửa */}
            {formData._id && (
              <div className="mb-4">
                <label className="block mb-2 font-medium">ID</label>
                <div className="w-full p-2 border rounded bg-gray-100 text-gray-500">
                  {formData._id.slice(-8)}{" "}
                  {/* Hiển thị một phần ID (lấy 8 ký tự cuối) */}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-2 font-medium">Type</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.type}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
                }
              >
                <option value="normal">Normal</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-2 font-medium">UID</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.uid}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, uid: e.target.value }))
                }
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCard}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {formData._id ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal xóa */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-md p-6 w-[400px]">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p>Bạn có chắc muốn xóa card này không?</p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
