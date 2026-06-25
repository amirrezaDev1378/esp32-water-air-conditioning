#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <time.h>
#include <cstring>

// ============================
// Wi-Fi + security
// ============================
const char* WIFI_SSID = "WasdWFFEEssad";
const char* WIFI_PASS = "624D9AE5asd3@#!#!@";
const char* CLIENT_TOKEN = "@#%#@$%^&&%^_fH2S_BRCT#@#$%$#%&^$&DFDS";

const uint16_t DISCOVERY_PORT = 4210;
// ============================
// Pin map (NodeMCU labels)
// ============================
#define PIN_TOUCH_PUMP D1  // GPIO5
#define PIN_TOUCH_FAN1 D2  // GPIO4
#define PIN_TOUCH_FAN2 D5  // GPIO14

#define PIN_RELAY_PUMP D6  // GPIO12
#define PIN_RELAY_FAN1 D7  // GPIO13
#define PIN_RELAY_FAN2 D0  // GPIO16

#define PIN_ONEWIRE_TEMP D4  // GPIO2

// ============================
// Hardware logic
// ============================
static const uint8_t RELAY_ON = HIGH;
static const uint8_t RELAY_OFF = LOW;

// static const bool TOUCH_ACTIVE_LOW = true;
const bool TOUCH_ACTIVE_HIGH = true;
// ============================
// Timing
// ============================
static const unsigned long TEMP_READ_INTERVAL_MS = 5000;
static const unsigned long HISTORY_INTERVAL_MS = 6000;
static const unsigned long TOUCH_DEBOUNCE_MS = 300;
static const unsigned long PUMP_WARMUP_MS = 10UL * 60UL * 1000UL;  // 10 minutes
static const unsigned long AUTO_LOOP_MS = 1000;

// ============================
// System state
// ============================
enum Mode { MODE_AUTO,
            MODE_MANUAL };

ESP8266WebServer server(80);
OneWire oneWire(PIN_ONEWIRE_TEMP);
DallasTemperature ds18b20(&oneWire);

unsigned long bootTime;

Mode mode = MODE_AUTO;
bool systemOn = false;

bool manualPump = false;
uint8_t manualFanSpeed = 0;  // 0=off, 1=speed1, 2=speed2

bool pumpOn = false;
uint8_t fanSpeed = 0;  // actual output state

float currentTemp = NAN;
bool sensorOk = false;
float targetTemp = 26.0;
float veryHotDelta = 2.5;

unsigned long lastTempReadMs = 0;
unsigned long lastHistoryMs = 0;
unsigned long lastAutoMs = 0;

unsigned long pumpOffMs = 0;
unsigned long pumpWarmupUntilMs = 0;

bool timeSynced = false;

// ============================
// History (latest 100 samples)
// ============================
struct TempPoint {
  time_t ts;
  float temp;
};

static const int HISTORY_SIZE = 100;
TempPoint historyBuf[HISTORY_SIZE];
int historyHead = 0;
int historyCount = 0;

// ============================
// Timers
// ============================
struct TimerItem {
  bool active;
  uint32_t id;
  time_t when;
  char action[6];     // "start" or "stop"
  char startMode[7];  // "auto" or "manual" (optional on start)
};

static const int MAX_TIMERS = 8;
TimerItem timers[MAX_TIMERS];
uint32_t nextTimerId = 1;

// ============================
// Helpers
// ============================
// const char* headerKeys[] = { "X-Client-Token" };

String modeName(Mode m) {
  return (m == MODE_AUTO) ? "auto" : "manual";
}

Mode parseMode(const String& s) {
  return s.equalsIgnoreCase("manual") ? MODE_MANUAL : MODE_AUTO;
}

bool isTimeValid() {
  return time(nullptr) > 1700000000;  // rough check for valid epoch time
}

String isoUtc(time_t ts) {
  struct tm* tmInfo = gmtime(&ts);
  if (!tmInfo) return "";
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", tmInfo);
  return String(buf);
}

bool authOk() {
  if (!server.hasHeader("X-Client-Token") || server.header("X-Client-Token") != CLIENT_TOKEN) {
    server.send(401, "application/json", "{\"ok\":false,\"error\":\"unauthorized\"}");
    return false;
  }
  return true;
}

bool parseBody(DynamicJsonDocument& doc) {
  if (!server.hasArg("plain")) return false;
  DeserializationError err = deserializeJson(doc, server.arg("plain"));
  return !err;
}





void setPump(bool on) {
  if (pumpOn == on) {
    digitalWrite(PIN_RELAY_PUMP, on ? RELAY_ON : RELAY_OFF);
    return;
  }
  pumpOn = on;
  digitalWrite(PIN_RELAY_PUMP, on ? RELAY_ON : RELAY_OFF);
  if (!on) pumpOffMs = millis();
}

void setFanSpeed(uint8_t speed) {
  fanSpeed = speed;
  digitalWrite(PIN_RELAY_FAN1, speed == 1 ? RELAY_ON : RELAY_OFF);
  digitalWrite(PIN_RELAY_FAN2, speed == 2 ? RELAY_ON : RELAY_OFF);
}

void outputsOff() {
  setPump(false);
  setFanSpeed(0);
}

void applyManualOutputs() {
  if (!systemOn) {
    outputsOff();
    return;
  }
  setPump(manualPump);
  setFanSpeed(manualFanSpeed);
}

void applyAutoOutputs() {
  if (!systemOn) {
    outputsOff();
    pumpWarmupUntilMs = 0;
    return;
  }

  if (!sensorOk) {
    outputsOff();
    return;
  }

  // Cool enough: everything off
  if (currentTemp <= targetTemp) {
    outputsOff();
    pumpWarmupUntilMs = 0;
    return;
  }

  // If pump has been OFF for more than 10 minutes, run it for 10 minutes first.
  if (!pumpOn && pumpWarmupUntilMs == 0 && (millis() - pumpOffMs >= PUMP_WARMUP_MS)) {
    pumpWarmupUntilMs = millis() + PUMP_WARMUP_MS;
  }

  // Warm-up phase
  if (pumpWarmupUntilMs > millis()) {
    setPump(true);
    setFanSpeed(0);
    return;
  }

  // After warm-up, prefer fan speed 1. Use speed 2 only when very hot.
  setPump(false);
  if (currentTemp >= targetTemp + veryHotDelta) {
    setFanSpeed(2);
  } else {
    setFanSpeed(1);
  }
}

void refreshOutputs() {
  if (!systemOn) {
    outputsOff();
    pumpWarmupUntilMs = 0;
    return;
  }

  if (mode == MODE_MANUAL) {
    applyManualOutputs();
  } else {
    applyAutoOutputs();
  }
}

void appendHistory(float temp) {
  // if (!isTimeValid()) return;
  Serial.print("Appending history");
  historyBuf[historyHead].ts = time(nullptr);
  historyBuf[historyHead].temp = temp;
  historyHead = (historyHead + 1) % HISTORY_SIZE;
  if (historyCount < HISTORY_SIZE) historyCount++;
}

void readTemperatureIfNeeded() {
  if (millis() - lastTempReadMs < TEMP_READ_INTERVAL_MS) return;
  lastTempReadMs = millis();

  ds18b20.requestTemperatures();
  float t = ds18b20.getTempCByIndex(0);
  Serial.print("Temperature read: ");
  Serial.println(t);
  if (t == DEVICE_DISCONNECTED_C || t < -55.0 || t > 125.0) {
    sensorOk = false;
    // TODO : return to not add history, disabled for development
    // return;
  } else {
    sensorOk = true;
  }

  currentTemp = t;

  if (millis() - lastHistoryMs >= HISTORY_INTERVAL_MS) {
    lastHistoryMs = millis();
    appendHistory(t);
  }
}

void handleTouchPump() {
  mode = MODE_MANUAL;
  systemOn = true;
  manualPump = !pumpOn;
  manualFanSpeed = fanSpeed;
  pumpWarmupUntilMs = 0;
  refreshOutputs();
}

void handleTouchFan1() {
  mode = MODE_MANUAL;
  systemOn = true;
  manualPump = pumpOn;
  manualFanSpeed = (fanSpeed == 1) ? 0 : 1;
  pumpWarmupUntilMs = 0;
  refreshOutputs();
}

void handleTouchFan2() {
  mode = MODE_MANUAL;
  systemOn = true;
  manualPump = pumpOn;
  manualFanSpeed = (fanSpeed == 2) ? 0 : 2;
  pumpWarmupUntilMs = 0;
  refreshOutputs();
}

void pollTouchSensors() {

  static bool initialized = false;

  static bool lastStatePump = false;
  static bool lastStateFan1 = false;
  static bool lastStateFan2 = false;

  static unsigned long lastChangePump = 0;
  static unsigned long lastChangeFan1 = 0;
  static unsigned long lastChangeFan2 = 0;

  bool pumpPressed = (digitalRead(PIN_TOUCH_PUMP) == HIGH);
  bool fan1Pressed = (digitalRead(PIN_TOUCH_FAN1) == HIGH);
  bool fan2Pressed = (digitalRead(PIN_TOUCH_FAN2) == HIGH);

  if (!initialized) {
    lastStatePump = pumpPressed;
    lastStateFan1 = fan1Pressed;
    lastStateFan2 = fan2Pressed;
    initialized = true;
  }

  if (millis() - bootTime < 3000) {
    lastStatePump = pumpPressed;
    lastStateFan1 = fan1Pressed;
    lastStateFan2 = fan2Pressed;
    return;
  }

  if (pumpPressed && !lastStatePump && millis() - lastChangePump > TOUCH_DEBOUNCE_MS) {
    lastChangePump = millis();
    handleTouchPump();
  }

  if (fan1Pressed && !lastStateFan1 && millis() - lastChangeFan1 > TOUCH_DEBOUNCE_MS) {
    lastChangeFan1 = millis();
    handleTouchFan1();
  }

  if (fan2Pressed && !lastStateFan2 && millis() - lastChangeFan2 > TOUCH_DEBOUNCE_MS) {
    lastChangeFan2 = millis();
    handleTouchFan2();
  }

  lastStatePump = pumpPressed;
  lastStateFan1 = fan1Pressed;
  lastStateFan2 = fan2Pressed;
}

void checkTimers() {
  if (!isTimeValid()) return;

  time_t now = time(nullptr);
  bool changed = false;

  for (int i = 0; i < MAX_TIMERS; i++) {
    if (!timers[i].active) continue;
    if (now < timers[i].when) continue;

    if (strcmp(timers[i].action, "stop") == 0) {
      systemOn = false;
      outputsOff();
      pumpWarmupUntilMs = 0;
    } else {
      systemOn = true;
      if (strlen(timers[i].startMode) > 0) {
        mode = parseMode(String(timers[i].startMode));
      }
    }

    timers[i].active = false;
    changed = true;
  }

  if (changed) {

    // ....
  };
}

// ============================
// API handlers
// ============================
void handleStatus() {
  if (!authOk()) return;

  DynamicJsonDocument doc(2048);
  doc["ok"] = true;
  doc["mode"] = modeName(mode);
  doc["systemOn"] = systemOn;
  doc["sensorOk"] = sensorOk;
  doc["targetTemp"] = targetTemp;
  doc["veryHotDelta"] = veryHotDelta;
  doc["pump"] = pumpOn;
  doc["fan1"] = (fanSpeed == 1);
  doc["fan2"] = (fanSpeed == 2);
  doc["fanSpeed"] = fanSpeed;
  doc["manualPump"] = manualPump;
  doc["manualFanSpeed"] = manualFanSpeed;
  doc["timeSynced"] = timeSynced;
  doc["uptimeSec"] = millis() / 1000UL;

  if (sensorOk) doc["currentTemp"] = currentTemp;
  else doc["currentTemp"] = nullptr;

  doc["pumpWarmupRemainingSec"] = (pumpWarmupUntilMs > millis()) ? ((pumpWarmupUntilMs - millis()) / 1000UL) : 0;

  if (isTimeValid()) {
    doc["utcNow"] = (int64_t)time(nullptr);
  }

  JsonObject wifi = doc.createNestedObject("wifi");
  wifi["ssid"] = WiFi.SSID();
  wifi["ip"] = WiFi.localIP().toString();

  JsonArray tarr = doc.createNestedArray("activeTimers");
  for (int i = 0; i < MAX_TIMERS; i++) {
    if (!timers[i].active) continue;
    JsonObject t = tarr.createNestedObject();
    t["id"] = timers[i].id;
    t["when"] = (int64_t)timers[i].when;
    t["action"] = timers[i].action;
    t["mode"] = timers[i].startMode;
  }

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handlePower() {
  if (!authOk()) return;

  DynamicJsonDocument doc(256);
  if (!parseBody(doc)) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"bad json\"}");
    return;
  }

  systemOn = doc["on"] | false;
  if (!systemOn) {
    outputsOff();
    pumpWarmupUntilMs = 0;
  } else {
    refreshOutputs();
  }

  server.send(200, "application/json", "{\"ok\":true}");
}

void handleMode() {
  if (!authOk()) return;

  DynamicJsonDocument doc(256);
  if (!parseBody(doc)) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"bad json\"}");
    return;
  }

  mode = parseMode(String(doc["mode"] | "auto"));
  refreshOutputs();
  server.send(200, "application/json", "{\"ok\":true}");
}

void handleTargetTemp() {
  if (!authOk()) return;

  DynamicJsonDocument doc(256);
  if (!parseBody(doc)) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"bad json\"}");
    return;
  }

  float temp = doc["temp"] | targetTemp;
  if (temp < 10.0 || temp > 40.0) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"temp out of range\"}");
    return;
  }

  targetTemp = temp;
  refreshOutputs();
  server.send(200, "application/json", "{\"ok\":true}");
}

void handleConfigGet() {
  if (!authOk()) return;

  DynamicJsonDocument doc(256);
  doc["ok"] = true;
  doc["veryHotDelta"] = veryHotDelta;

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handleConfigSet() {
  if (!authOk()) return;

  DynamicJsonDocument doc(256);
  if (!parseBody(doc)) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"bad json\"}");
    return;
  }

  float delta = doc["veryHotDelta"] | veryHotDelta;
  if (delta < 0.5 || delta > 10.0) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"veryHotDelta out of range\"}");
    return;
  }

  veryHotDelta = delta;
  refreshOutputs();
  server.send(200, "application/json", "{\"ok\":true}");
}

void handleManual() {
  if (!authOk()) return;

  DynamicJsonDocument doc(256);
  if (!parseBody(doc)) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"bad json\"}");
    return;
  }

  mode = MODE_MANUAL;
  systemOn = true;

  if (doc.containsKey("pump")) manualPump = doc["pump"].as<bool>();
  bool f1 = doc.containsKey("fan1") ? doc["fan1"].as<bool>() : false;
  bool f2 = doc.containsKey("fan2") ? doc["fan2"].as<bool>() : false;

  if (f2) manualFanSpeed = 2;
  else if (f1) manualFanSpeed = 1;
  else manualFanSpeed = 0;

  refreshOutputs();
  server.send(200, "application/json", "{\"ok\":true}");
}

void handleHistory() {
  if (!authOk()) return;

  int limit = 100;
  if (server.hasArg("limit")) {
    limit = server.arg("limit").toInt();
    if (limit <= 0) limit = 100;
    if (limit > 100) limit = 100;
  }

  int count = (historyCount < limit) ? historyCount : limit;

  DynamicJsonDocument doc(8192);
  doc["ok"] = true;
  doc["sensorOk"] = sensorOk;
  doc["count"] = count;

  JsonArray arr = doc.createNestedArray("items");
  for (int i = 0; i < count; i++) {
    int idx = (historyHead - historyCount + i + HISTORY_SIZE) % HISTORY_SIZE;
    JsonObject item = arr.createNestedObject();
    item["ts"] = (int64_t)historyBuf[idx].ts;
    item["iso"] = isoUtc(historyBuf[idx].ts);
    item["temp"] = historyBuf[idx].temp;
  }

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handleTimersList() {
  if (!authOk()) return;

  DynamicJsonDocument doc(2048);
  doc["ok"] = true;

  JsonArray arr = doc.createNestedArray("timers");
  for (int i = 0; i < MAX_TIMERS; i++) {
    if (!timers[i].active) continue;
    JsonObject t = arr.createNestedObject();
    t["id"] = timers[i].id;
    t["when"] = (int64_t)timers[i].when;
    t["iso"] = isoUtc(timers[i].when);
    t["action"] = timers[i].action;
    t["mode"] = timers[i].startMode;
  }

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handleAddTimer() {
  if (!authOk()) return;

  DynamicJsonDocument doc(256);
  if (!parseBody(doc)) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"bad json\"}");
    return;
  }

  String action = String(doc["action"] | "");
  action.toLowerCase();

  time_t when = (time_t)(int64_t)(doc["when"] | 0);
  String startMode = String(doc["mode"] | "");
  startMode.toLowerCase();

  if (!(action == "start" || action == "stop")) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"action must be start or stop\"}");
    return;
  }

  if (when <= 0) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"invalid when\"}");
    return;
  }

  int slot = -1;
  for (int i = 0; i < MAX_TIMERS; i++) {
    if (!timers[i].active) {
      slot = i;
      break;
    }
  }

  if (slot < 0) {
    server.send(409, "application/json", "{\"ok\":false,\"error\":\"timer list full\"}");
    return;
  }

  timers[slot].active = true;
  timers[slot].id = nextTimerId++;
  timers[slot].when = when;
  strlcpy(timers[slot].action, action.c_str(), sizeof(timers[slot].action));
  strlcpy(timers[slot].startMode, startMode.c_str(), sizeof(timers[slot].startMode));


  DynamicJsonDocument resp(256);
  resp["ok"] = true;
  resp["id"] = timers[slot].id;

  String out;
  serializeJson(resp, out);
  server.send(200, "application/json", out);
}

void handleDeleteTimer() {
  if (!authOk()) return;

  if (!server.hasArg("id")) {
    server.send(400, "application/json", "{\"ok\":false,\"error\":\"missing id\"}");
    return;
  }

  uint32_t id = server.arg("id").toInt();
  bool removed = false;

  for (int i = 0; i < MAX_TIMERS; i++) {
    if (timers[i].active && timers[i].id == id) {
      timers[i].active = false;
      removed = true;
      break;
    }
  }

  if (removed) {
    //  ....
  };

  server.send(200, "application/json", removed ? "{\"ok\":true}" : "{\"ok\":false,\"error\":\"not found\"}");
}

void handleNotFound() {
  server.send(404, "application/json", "{\"ok\":false,\"error\":\"not found\"}");
}

// ============================
// Setup helpers
// ============================
void setupPins() {
  pinMode(PIN_RELAY_PUMP, OUTPUT);
  pinMode(PIN_RELAY_FAN1, OUTPUT);
  pinMode(PIN_RELAY_FAN2, OUTPUT);

  digitalWrite(PIN_RELAY_PUMP, RELAY_OFF);
  digitalWrite(PIN_RELAY_FAN1, RELAY_OFF);
  digitalWrite(PIN_RELAY_FAN2, RELAY_OFF);

  pinMode(PIN_TOUCH_PUMP, INPUT);
  pinMode(PIN_TOUCH_FAN1, INPUT);
  pinMode(PIN_TOUCH_FAN2, INPUT);
}

void connectWiFi() {

  WiFi.mode(WIFI_STA);
  WiFi.hostname("AC-Controller");

  // Preferred static IP
  IPAddress local_IP(192, 168, 70, 85);
  IPAddress gateway(192, 168, 70, 1);
  IPAddress subnet(255, 255, 255, 0);
  IPAddress dns1(8, 8, 8, 8);

  Serial.println("Trying static IP...");

  WiFi.config(local_IP, gateway, subnet, dns1);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  unsigned long start = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - start < 15000) {
    delay(250);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println();
    Serial.println("Connected using static IP");

    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

    return;
  }

  Serial.println();
  Serial.println("Static IP failed, trying DHCP...");

  WiFi.disconnect(true);

  delay(1000);

  // Return to DHCP
  WiFi.config(0U, 0U, 0U);

  WiFi.begin(WIFI_SSID, WIFI_PASS);

  start = millis();

  while (WiFi.status() != WL_CONNECTED &&
         millis() - start < 15000) {
    delay(250);
    Serial.print(".");
  }

  if (WiFi.status() == WL_CONNECTED) {

    Serial.println();
    Serial.println("Connected using DHCP");

    Serial.print("IP: ");
    Serial.println(WiFi.localIP());

  } else {

    Serial.println();
    Serial.println("WiFi connection failed");

  }
}

void syncClock() {
  configTime(0, 0, "pool.ntp.org", "time.nist.gov", "time.google.com");

  unsigned long start = millis();
  while (!isTimeValid() && millis() - start < 15000) {
    delay(250);
  }
  timeSynced = isTimeValid();
}

void setupRoutes() {
  server.collectHeaders("X-Client-Token");

  server.on("/api/v1/status", HTTP_GET, handleStatus);
  server.on("/api/v1/power", HTTP_POST, handlePower);
  server.on("/api/v1/mode", HTTP_POST, handleMode);
  server.on("/api/v1/target-temp", HTTP_POST, handleTargetTemp);
  server.on("/api/v1/manual", HTTP_POST, handleManual);
  server.on("/api/v1/history", HTTP_GET, handleHistory);

  server.on("/api/v1/config", HTTP_GET, handleConfigGet);
  server.on("/api/v1/config", HTTP_POST, handleConfigSet);

  server.on("/api/v1/timers", HTTP_GET, handleTimersList);
  server.on("/api/v1/timer", HTTP_POST, handleAddTimer);
  server.on("/api/v1/timer", HTTP_DELETE, handleDeleteTimer);

  server.onNotFound(handleNotFound);
}


void setup() {
  Serial.begin(115200);
  delay(300);
  bootTime = millis();

  setupPins();
  systemOn = false;
  mode = MODE_AUTO;

  manualPump = false;
  manualFanSpeed = 0;


  outputsOff();
  pumpOffMs = millis();


  ds18b20.begin();

  connectWiFi();
  syncClock();


  // Restore outputs after loading state
  refreshOutputs();

  setupRoutes();
  server.begin();

  Serial.println();
  Serial.println("AC controller ready");
  Serial.println(WiFi.localIP());
}

void loop() {
  server.handleClient();

  readTemperatureIfNeeded();
  pollTouchSensors();

  if (millis() - lastAutoMs >= AUTO_LOOP_MS) {
    lastAutoMs = millis();
    checkTimers();
    refreshOutputs();
  }

}
