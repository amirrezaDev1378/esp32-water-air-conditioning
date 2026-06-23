#include <OneWire.h>
#include <DallasTemperature.h>

// Touch Sensors
#define TOUCH1 D1   // GPIO5
#define TOUCH2 D2   // GPIO4
#define TOUCH3 D5   // GPIO14

// Relays
#define RELAY1 D6   // GPIO12
#define RELAY2 D7   // GPIO13
#define RELAY3 D0   // GPIO16

// Temperature Sensor (DS18B20)
#define TEMP_PIN D4 // GPIO2

OneWire oneWire(TEMP_PIN);
DallasTemperature sensors(&oneWire);

// Relay states
bool relayState1 = false;
bool relayState2 = false;
bool relayState3 = false;

// Previous touch states
bool lastTouch1 = LOW;
bool lastTouch2 = LOW;
bool lastTouch3 = LOW;

unsigned long lastTempRead = 0;

void setup()
{
    Serial.begin(115200);

    pinMode(TOUCH1, INPUT);
    pinMode(TOUCH2, INPUT);
    pinMode(TOUCH3, INPUT);

    pinMode(RELAY1, OUTPUT);
    pinMode(RELAY2, OUTPUT);
    pinMode(RELAY3, OUTPUT);

    digitalWrite(RELAY1, LOW);
    digitalWrite(RELAY2, LOW);
    digitalWrite(RELAY3, LOW);

    sensors.begin();

    Serial.println("Touch Toggle Relay Controller Started");
}

void loop()
{
    bool touch1 = digitalRead(TOUCH1);
    bool touch2 = digitalRead(TOUCH2);
    bool touch3 = digitalRead(TOUCH3);

    // Rising edge detection (released -> touched)
    if (touch1 == HIGH && lastTouch1 == LOW)
    {
        relayState1 = !relayState1;
        digitalWrite(RELAY1, relayState1);
        Serial.printf("Relay 1: %s\n", relayState1 ? "ON" : "OFF");
    }

    if (touch2 == HIGH && lastTouch2 == LOW)
    {
        relayState2 = !relayState2;
        digitalWrite(RELAY2, relayState2);
        Serial.printf("Relay 2: %s\n", relayState2 ? "ON" : "OFF");
    }

    if (touch3 == HIGH && lastTouch3 == LOW)
    {
        relayState3 = !relayState3;
        digitalWrite(RELAY3, relayState3);
        Serial.printf("Relay 3: %s\n", relayState3 ? "ON" : "OFF");
    }

    lastTouch1 = touch1;
    lastTouch2 = touch2;
    lastTouch3 = touch3;

    // Read temperature every 2 seconds
    if (millis() - lastTempRead > 2000)
    {
        lastTempRead = millis();

        sensors.requestTemperatures();
        float temp = sensors.getTempCByIndex(0);

        Serial.print("Temperature: ");
        Serial.print(temp);
        Serial.println(" C");
    }

    delay(20); // small debounce
}
