#define BLYNK_TEMPLATE_ID "TMPL6Ay4jEwKd"
#define BLYNK_TEMPLATE_NAME "Parking lot Controller"
#define BLYNK_AUTH_TOKEN "A9kJy9o658W6tqrJJZCY0r7jPPNtCITu"

#include <Arduino.h>
#include <WiFi.h>
#include <SocketIoClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>
#include <ArduinoJson.h>
#include <BlynkSimpleEsp32.h>
// Define pin and initialize
#define SS_PIN 4
#define RST_PIN 15
#define SERVO_IN_PIN 33
#define SERVO_OUT_PIN 32
#define BUTTON_IN 13
#define BUTTON_OUT 12
#define IR_IN_PIN 34
#define IR_OUT_PIN 35

#define IR_SLOT_1_PIN 14
#define IR_SLOT_2_PIN 25
#define IR_SLOT_4_PIN 26
#define IR_SLOT_3_PIN 27

bool servoInState = false;  // false: đóng, true: mở
bool servoOutState = false; // false: đóng, true: mở

String lastScanUidIn = "";
String lastScanUidOut = "";
MFRC522 mfrc522(SS_PIN, RST_PIN);
LiquidCrystal_I2C lcd(0x27, 20, 4);
Servo servoIn;
Servo servoOut;

const char auth[] = BLYNK_AUTH_TOKEN;
const char *ssid = "AiLoan02";
const char *password = "mancityvodich";
const char *host = "192.168.1.20"; // IP server Node.js
const int port = 3000;

bool CurrentIn = false;
bool CurrentOut = false;

bool S1 = false, S2 = false, S3 = false, S4 = false;
SocketIoClient socket;

// Function to handle servos

// Read RFID card and handle
String getCardUID()
{
  String id = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    id += String(mfrc522.uid.uidByte[i], HEX);
  }
  return id;
}

// Send UID to Python and wait for response
String sendToPython()
{
  Serial.println("check-plate"); // Gửi tín hiệu UID
  String response = "";

  // Đợi Python trả về biển số
  unsigned long startMillis = millis();
  while (millis() - startMillis < 5000) // Chờ tối đa 5 giây
  {
    if (Serial.available())
    {
      response = Serial.readStringUntil('\n'); // Đọc phản hồi từ Python
      response.trim();
      break;
    }
  }
  return response;
}

// Gửi biển số lên Socket.IO
void sendPlateToServer(String uid, String plate, String mes)
{
  DynamicJsonDocument json(256);
  json["uid"] = uid;
  json["plate"] = plate;

  String payload;
  serializeJson(json, payload);
  socket.emit(mes.c_str(), payload.c_str());
}

void updateServoState(String servoName, bool state)
{
  if (servoName == "servoIn")
  {
    socket.emit(state ? "open-in" : "close-in");
  }
  else if (servoName == "servoOut")
  {
    // Serial.print("2");
    socket.emit(state ? "open-out" : "close-out");
  }
}

void onCheckOutUserSuccess(const char *payload, size_t length)
{
  // Parse JSON từ payload
  DynamicJsonDocument doc(256);
  deserializeJson(doc, payload);

  // Lấy dữ liệu từ JSON
  String userName = doc["name"];

  // Hiển thị thông điệp check-out
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Goodbye " + userName);
  servoOut.write(90); // Góc mở

  updateServoState("servoOut", true);
  CurrentOut = true;
  delay(1000);
}

void onCheckOutSuccess(const char *payload, size_t length)
{
  DynamicJsonDocument doc(256);
  deserializeJson(doc, payload);
  String bill = doc["bill"];

  lcd.clear();
  lcd.setCursor(0, 1);
  lcd.print("Bill: " + bill);

  // Mở servo ra
  servoOut.write(90); // Góc mở
  updateServoState("servoOut", true);
  CurrentOut = true;
  delay(1000);
}

// Hàm xử lý sự kiện "check-in-user-success" có user
void onCheckInUserSuccess(const char *payload, size_t length)
{
  // Parse JSON từ payload
  DynamicJsonDocument doc(256);
  deserializeJson(doc, payload);

  // Lấy dữ liệu từ JSON
  String userName = doc["name"];

  // Hiển thị thông điệp check-in
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Welcome " + userName);
  servoIn.write(90);
  updateServoState("servoIn", true);

  CurrentIn = true;
  delay(1000);
}
void onCheckInSuccess(const char *payload, size_t length)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Welcome ");

  // Mở servo vào

  servoIn.write(90);
  updateServoState("servoIn", true);
  CurrentIn = true;
  delay(1000);
}

void onInvalidCardIn(const char *payload, size_t length)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Invalid Card In");
  lastScanUidIn = "";
  delay(1000);
}
void onUserNotFound(const char *payload, size_t length)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("User not found");
  lastScanUidIn = "";
  delay(1000);
}
void onInvalidCardOut(const char *payload, size_t length)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Invalid Card Out");
  lastScanUidOut = "";
  delay(1000);
}
void onCheckInCardInUse(const char *payload, size_t length)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Card in use by another");
  lastScanUidIn = "";
  delay(1000);
}
void onCheckOutCardNotInUse(const char *payload, size_t length)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Card not in use");
  lastScanUidOut = "";
  delay(1000);
}
void onCheckOutCardFalsePlate(const char *payload, size_t length)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("False plate");
  lastScanUidOut = "";
  delay(1000);
}
void handleCloseServoIn()
{
  if (digitalRead(BUTTON_IN) == HIGH && CurrentIn && digitalRead(IR_IN_PIN) == HIGH)
  {
    delay(1000);
    servoIn.write(180);
    CurrentIn = false;
    updateServoState("servoIn", false);
  }
}
void handleCloseServoOut()
{
  // cửa out mở , không nhấn btn mở cửa out , không có vật cản cửa out
  if (digitalRead(BUTTON_OUT) == HIGH && CurrentOut && digitalRead(IR_OUT_PIN) == HIGH)
  {
    delay(1000);
    servoOut.write(180);
    CurrentOut = false;
    updateServoState("servoOut", false);
  }

}
void handleServoButton(int buttonPin, Servo &servo)
{

  if (digitalRead(buttonPin) == LOW)
  {

    servo.write(90);
    if (buttonPin == BUTTON_IN && !CurrentIn)
    {
      updateServoState("servoIn", true);
      CurrentIn = true;
    }
    if (buttonPin == BUTTON_OUT && !CurrentOut)
    {
      updateServoState("servoOut", true);
      CurrentOut = true;
    }
  }

}
void readSensors()
{
  delay(100);

  bool tempS1 = digitalRead(IR_SLOT_1_PIN);
  bool tempS2 = digitalRead(IR_SLOT_2_PIN);
  bool tempS3 = digitalRead(IR_SLOT_3_PIN);
  bool tempS4 = digitalRead(IR_SLOT_4_PIN);

  // Nếu trạng thái của các cảm biến thay đổi, gửi dữ liệu qua serial
  if (tempS1 != S1 || tempS2 != S2 || tempS3 != S3 || tempS4 != S4)
  {

    // Lấy dữ liệu từ JSON
    String data = String(tempS1) + String(tempS2) + String(tempS3)  + String(tempS4);
    DynamicJsonDocument doc(256);
    doc["slot"] = data;
    String jsonOutput;
    serializeJson(doc, jsonOutput);
    socket.emit("update-slot", jsonOutput.c_str());

    Blynk.virtualWrite(V0, tempS1);
    Blynk.virtualWrite(V1, tempS2);
    Blynk.virtualWrite(V2, tempS3);
    Blynk.virtualWrite(V3, tempS4);
    S1 = tempS1;
    S2 = tempS2;
    S3 = tempS3;
    S4 = tempS4;
  }
}

void setup()
{
  Serial.begin(9600);
  delay(1000);

  // Initialize pins
  pinMode(BUTTON_IN, INPUT_PULLUP);
  pinMode(BUTTON_OUT, INPUT_PULLUP);
  pinMode(IR_IN_PIN, INPUT);
  pinMode(IR_OUT_PIN, INPUT);
  pinMode(IR_SLOT_1_PIN, INPUT);
  pinMode(IR_SLOT_2_PIN, INPUT);
  pinMode(IR_SLOT_3_PIN, INPUT);
  pinMode(IR_SLOT_4_PIN, INPUT);

  WiFi.begin(ssid, password);
  SPI.begin(18, 19, 23);

  // Wait for Wi-Fi connection
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }
  Blynk.begin(BLYNK_AUTH_TOKEN, ssid, password);
  Serial.println(WiFi.localIP());
  // Initialize RFID
  mfrc522.PCD_Init();
  // Initialize Socket.IO
  socket.begin(host, port);
  // Attach servo
  servoIn.attach(SERVO_IN_PIN);
  servoIn.write(180);
  servoOut.attach(SERVO_OUT_PIN);
  servoOut.write(180);
  // Initialize LCD
  lcd.init();
  lcd.clear();
  lcd.setBacklight(true);
  lcd.print("Parking lot v2");
  socket.on("check-in-success", onCheckInSuccess);
  socket.on("check-out-success", onCheckOutSuccess);
  // Lắng nghe sự kiện check-in-user-success có user
  socket.on("check-in-user-success", onCheckInUserSuccess);
  socket.on("check-out-user-success", onCheckOutUserSuccess);
  socket.on("invalid-check-in-card", onInvalidCardIn);
  socket.on("invalid-check-out-card", onInvalidCardOut);
  socket.on("check-in-card-in-use", onCheckInCardInUse);
  socket.on("user-not-found", onUserNotFound);
  socket.on("check-out-card-not-in-use", onCheckOutCardNotInUse);
  socket.on("check-out-false-license-plate", onCheckOutCardFalsePlate);
}

void loop()
{
  // Đọc thẻ RFID
  if (mfrc522.PICC_IsNewCardPresent() && mfrc522.PICC_ReadCardSerial())
  {
    String cardUID = getCardUID();
    if (digitalRead(IR_IN_PIN) == LOW && cardUID != lastScanUidIn)
    {
      if (S1 == 0 && S2 == 0 && S3 == 0 && S4 == 0)
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Full Slot");
        delay(1000);
        lastScanUidIn = "";
      }else{
        lastScanUidIn = cardUID;

        // Gửi UID tới Python và đợi phản hồi
        String licensePlateIn = sendToPython();

        if (licensePlateIn != "")
        {
          Serial.println("Received plate: " + licensePlateIn);

          // Gửi biển số lên Socket.IO server
          sendPlateToServer(lastScanUidIn, licensePlateIn, "check-in");
        }
        else
        {
          lcd.clear();
          lcd.setCursor(0, 0);
          lcd.print("No plate received");
          lastScanUidIn = "";
        }
      }
      
    }
    else if (digitalRead(IR_OUT_PIN) == LOW && cardUID != lastScanUidOut)
    {
      lastScanUidOut = cardUID;

      // Gửi UID tới Python và đợi phản hồi
      String licensePlateOut = sendToPython();
      if (licensePlateOut != "")
      {
        // Gửi biển số lên Socket.IO server
        sendPlateToServer(lastScanUidOut, licensePlateOut, "check-out");
      }
      else
      {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("No plate received");
        lastScanUidOut = "";
      }
    }
  }
  handleCloseServoIn();
  handleCloseServoOut();
  handleServoButton(BUTTON_IN, servoIn);
  handleServoButton(BUTTON_OUT, servoOut);
  readSensors();
  socket.loop(); // Socket.IO loop
  Blynk.run();
}