import tkinter as tk
from tkinter import messagebox
import cv2
from PIL import Image, ImageTk
import threading
import easyocr
from ultralytics import YOLO
import torch
import serial

# Kiểm tra GPU có sẵn không
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")

# Kết nối với ESP qua cổng serial
try:
    esp_serial = serial.Serial(port='COM3', baudrate=9600, timeout=1)  # Thay 'COM3' bằng cổng của bạn
    print("Connected to ESP via Serial")
except serial.SerialException as e:
    esp_serial = None
    print(f"Failed to connect to ESP: {e}")


# Hàm gửi biển số cho ESP
def send_plate_to_esp(plate_number):
    if esp_serial:
        message = f"{plate_number}\n"
        esp_serial.write(message.encode('utf-8'))
        print(f"Sent to ESP: {message}")

# Hàm đọc tín hiệu từ ESP
def read_message_from_esp():
    while True:
        if esp_serial and esp_serial.in_waiting > 0:
            message = esp_serial.readline()
            message = message.decode('utf-8', errors='ignore').strip()  # Bỏ qua lỗi giải mã
            print(f"Received from ESP: {message}")
            if message.startswith("check-plate"):
                capture_and_recognize()


# Hàm cập nhật hình ảnh từ camera
def update_camera():
    global cap, camera_label
    while True:
        if cap is not None:
            ret, frame = cap.read()
            if ret:
                frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frame = cv2.resize(frame, (300, 150))
                img = ImageTk.PhotoImage(Image.fromarray(frame))
                camera_label.configure(image=img)
                camera_label.image = img

# Hàm nhận diện ký tự biển số
def segment_image(image):
    reader = easyocr.Reader(['en'], gpu=True)  # Khởi tạo EasyOCR với GPU
    results = reader.readtext(image)

    if not results:
        return ""

    conversion_dict = {
        'l': '1', 'o': '0', 'i': '1', 'g': '9', 'a': '9',
        'b': '6', 's': '5', 'q': '9',
    }

    def convert_text(text):
        filtered_text = ''.join([char if char.isalnum() else '' for char in text])
        return ''.join([conversion_dict.get(char, char) for char in filtered_text])

    formatted_results = [convert_text(result[1]) for result in results]
    return ' '.join(formatted_results)

# Hàm chụp ảnh và nhận diện biển số
def capture_and_recognize():
    global cap, model
    if cap is not None:
        ret, frame = cap.read()
        if ret:
            results = model(frame)
            detected_plate = ""  # Làm mới biến biển số trước mỗi lần nhận dạng
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0])
                    cropped = frame[y1:y2, x1:x2]
                    license_text = segment_image(cropped)
                    detected_plate = license_text
                    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    cv2.putText(frame, license_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

            # Gửi biển số đến ESP (nếu có)
            send_plate_to_esp(detected_plate)

            # Reset biển số sau khi xử lý xong
            detected_plate = ""

# Khởi tạo camera và mô hình YOLO
cap = cv2.VideoCapture(1)

model = YOLO("runs/detect/train/weights/best.pt")  # Đường dẫn mô hình YOLO
model.to(device)

# Giao diện chính
window = tk.Tk()
window.title("BÃI ĐỖ XE THÔNG MINH")
window.geometry("1200x800")

# Header
header = tk.Label(window, text="BÃI ĐỖ XE THÔNG MINH", bg="blue", fg="white", font=("Arial", 16))
header.pack(fill=tk.X)

# Khung hiển thị camera
frame_camera = tk.Frame(window, bg="black", width=1000, height=600)
frame_camera.place(x=30, y=60)
camera_label = tk.Label(frame_camera)
camera_label.pack(expand=True)




btn_quit = tk.Button(window, text="THOÁT", font=("Arial", 12), bg="black", fg="white", width=10, command=window.quit)
btn_quit.place(x=550, y=700)

# Chạy luồng cập nhật camera
threading.Thread(target=update_camera, daemon=True).start()

# Chạy luồng nhận thông tin từ ESP
if esp_serial:
    threading.Thread(target=read_message_from_esp, daemon=True).start()

# Chạy chương trình
window.mainloop()

# Giải phóng tài nguyên
cap.release()
cv2.destroyAllWindows()