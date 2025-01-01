import cv2

def open_cameras(camera_id_1=2, camera_id_2=1):
    # Mở hai camera với các ID khác nhau (0 và 1)
    cap1 = cv2.VideoCapture(camera_id_1)
    cap2 = cv2.VideoCapture(camera_id_2)

    if not cap1.isOpened():
        print(f"Không thể mở camera {camera_id_1}")
        return
    if not cap2.isOpened():
        print(f"Không thể mở camera {camera_id_2}")
        return

    while True:
        # Đọc từng khung hình từ các camera
        ret1, frame1 = cap1.read()
        ret2, frame2 = cap2.read()

        if not ret1 or not ret2:
            print("Không thể nhận diện khung hình từ một trong các camera")
            break

        # Hiển thị khung hình từ camera 1 và camera 2
        cv2.imshow('Camera 1', frame1)
        cv2.imshow('Camera 2', frame2)

        # Dừng khi nhấn phím 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    # Giải phóng camera và đóng cửa sổ hiển thị
    cap1.release()
    cap2.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    open_cameras()  # Mở camera đầu tiên (ID = 0) và camera thứ hai (ID = 1)
