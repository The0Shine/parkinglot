import cv2
import easyocr
from ultralytics import YOLO
import torch

# Kiểm tra GPU có sẵn không
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Using device: {device}")

# Hàm nhận diện ký tự biển số
def segment_image(image):
    reader = easyocr.Reader(['en'], gpu=True)  # Khởi tạo EasyOCR với GPU
    results = reader.readtext(image)

    if not results:
        return ""

    conversion_dict = {
        'l': '1', 'i': '1', 'g': '9', 'a': '9',
        'b': '6', 's': '5', 'q': '9',
    }

    def convert_text(text):
        filtered_text = ''.join([char if char.isalnum() else '' for char in text])
        return ''.join([conversion_dict.get(char, char) for char in filtered_text])

    formatted_results = [convert_text(result[1]) for result in results]
    return ' '.join(formatted_results)

# Hàm chụp ảnh và nhận diện biển số
def capture_and_recognize(cap, model):
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
                # Vẽ hình chữ nhật xung quanh biển số
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                # Hiển thị biển số trên hình ảnh
                cv2.putText(frame, license_text, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        # Hiển thị frame với biển số nhận diện
        cv2.imshow("Camera Feed", frame)

        print(f"Detected Plate: {detected_plate}")
        return detected_plate

# Khởi tạo camera và mô hình YOLO
cap = cv2.VideoCapture(0)
model = YOLO("runs/detect/train/weights/best.pt")  # Đường dẫn mô hình YOLO
model.to(device)

# Tiến hành nhận diện biển số
while True:
    detected_plate = capture_and_recognize(cap, model)
    if detected_plate:
        print(f"Detected Plate: {detected_plate}")

    # Thoát khi nhấn phím 'q'
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Giải phóng tài nguyên và đóng cửa sổ
cap.release()
cv2.destroyAllWindows()
