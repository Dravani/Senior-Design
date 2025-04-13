const { createClient } = require("@supabase/supabase-js");
const dotenv = require("dotenv");

dotenv.config();

// Supabase setup for default
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// EDIT THIS TOO, when we have multiple sensors beyond DHT and NETWORK 
const setupWebSocket = (wsServer) => {
  wsServer.on("connection", async (ws, req) => {
    const sensorName = req.url.split("/")[2];
    console.log(`New WebSocket connection for sensor: ${sensorName}`);

    // Determine whether the path includes "network"
    const isNetworkSensor = req.url.includes("network");

    // Use appropriate Supabase client based on whether the request is for a network sensor
    const currentSupabaseClient = supabase;
    const tableName = isNetworkSensor ? "Network" : "Sensor";
    // const timeName = isNetworkSensor ? "created_at" : "timestamp";
    const columVal = isNetworkSensor ? "ip" : "sensor_name";
    // const timeCheck = isNetworkSensor ? 300 : 2000;


    // Function to send the latest sensor data
    const sendLatestReading = async () => {
      try {
        const { data, error } = await currentSupabaseClient
          .from(tableName)
          .select("*")
          .eq(columVal, sensorName)
          .order(isNetworkSensor ? "created_at" : "timestamp", { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error("Database error:", error);
          ws.send(JSON.stringify({ error: "Failed to fetch data" }));
          // return;
        } else {
          // Send the latest data to the client
          ws.send(JSON.stringify(data));
        }
      } catch (error) {
        console.error("Error sending reading:", error);
      }
    };

    const channel = currentSupabaseClient
      .channel(`realtime:${tableName}-${sensorName}`)
      .on(
        "postgres_changes",
        {
          event:  "*",
          schema: "public",
          table: tableName,
          filter: `${columVal}=eq.${sensorName}`
        },
        (payload) => {
          console.log("Update: ", payload);
          ws.send(JSON.stringify(payload.new));
        }
      )
      .subscribe();

    // Cleanup when the WebSocket is closed
    ws.on("close", async () => {
      //clearInterval(interval);
      await currentSupabaseClient.removeChannel(channel);
      console.log(`WebSocket closed for sensor: ${sensorName}`);
    });
  });

  console.log("WebSocket server is running...");
};

module.exports = setupWebSocket;
