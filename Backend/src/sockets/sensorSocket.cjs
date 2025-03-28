const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const setupWebSocket = (wsServer) => {
  wsServer.on("connection", (ws, req) => {

    const sensorName = req.url.split("/")[2];
    console.log(`New WebSocket connection for sensor: ${sensorName}`);

    // Function to send the latest sensor data
    const sendLatestReading = async () => {
      try {
        const { data, error } = await supabase
          .from("Sensor")
          .select("*")
          .eq("sensor_name", sensorName)
          .limit(1)
          .single();

        if (error) {
          console.error("Database error:", error);
          ws.send(JSON.stringify({ error: "Failed to fetch data" }));
          return;
        }

        // Send the latest data to the client
        ws.send(JSON.stringify(data));
      } catch (error) {
        console.error("Error sending reading:", error);
      }
    };

    // Send the latest reading every 3 seconds
    const interval = setInterval(sendLatestReading, 3000);

    // Cleanup when the WebSocket is closed
    ws.on("close", () => {
      clearInterval(interval);
      console.log(`WebSocket closed for sensor: ${sensorName}`);
    });
  });

  console.log("WebSocket server is running...");
};

module.exports = setupWebSocket;
