# Arduino IDE Setup
Connect the ESP32-S3

Use a USB-C cable and plug it into the left USB-C port on your computer.
Open Arduino IDE

Copy and paste the desired code from GitHub into a new sketch.
Select the Correct Board and Port

Go to Tools > Board and choose ESP32-S3 Dev Module.
Ensure the correct serial port is selected under Tools > Port (should detect as an ESP32 device).
Configure Upload Settings

Upload Speed: 115200
Upload Mode: Hardware CDC
Upload the Code

Click the Upload button and wait for the process to complete.

Use the following link within the preferences additional boards manager: `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`