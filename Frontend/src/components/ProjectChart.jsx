import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ProjectChart = ({ sensorName, dataType, liveMode, startTime, endTime, sensorType }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: dataType === "humidity" ? "Humidity (%)" : "Temperature (°C)",
                data: [],
                borderColor: "#39D869",
                borderWidth: 2,
                fill: false,
            },
        ],
    });

    const wsRef = useRef(null);

    const options = {
        responsive: true,
        scales: {
            x: { ticks: { display: false }, grid: { display: false } },
            y: { ticks: { beginAtZero: true } },
        },
    };

    // Function to fetch historical data (if not in live mode)
    const fetchData = async () => {
        if (!sensorName || liveMode) return;

        try {
            let url = "";
            if (sensorType === "DHT") {
                url = `http://localhost:3000/api/sensors/read/${sensorName}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}&type=${dataType}`;
            } else if (sensorType === "Network") {
                url = `http://localhost:3000/api/sensors/network/read/${sensorName}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;
            } else {
                console.warn("Unknown sensor type selected:", sensorType);
                return;
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
            const data = await response.json();

            setChartData({
                labels: data.labels, // Timestamps (hidden)
                datasets: [{ label: "Sensor Data", data: data.values, borderColor: "#39D869", borderWidth: 2, fill: false }],
            });
        } catch (error) {
            console.error("Error fetching sensor data:", error);
        }
    };

    // WebSocket for Live Mode
    useEffect(() => {
        if (!sensorName || !liveMode) return;

        let socketUrl = "";
        if (sensorType === "DHT") {
            socketUrl = `ws://localhost:8080/readings/${sensorName}`;
        } else if (sensorType === "Network") {
            socketUrl = `ws://localhost:8080/network/${sensorName}`;
        } else {
            console.warn("Unknown sensor type for WebSocket:", sensorType);
            return;
        }

        const socket = new WebSocket(socketUrl);
        wsRef.current = socket;

        socket.onopen = () => console.log(`Connected to WebSocket for: ${sensorName}`);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Live data received:", data);

                setChartData((prev) => ({
                    labels: [...prev.labels, ""],
                    datasets: [{
                        ...prev.datasets[0],
                        data: [
                            ...prev.datasets[0].data,
                            sensorType === "DHT" ? data[dataType] : data["packet_length"]
                        ]
                    }],
                }));
                           
            } catch (error) {
                console.error("Error parsing WebSocket data:", error);
            }
        };

        socket.onclose = () => console.log(`WebSocket closed for: ${sensorName}`);
        socket.onerror = (error) => console.error("WebSocket error:", error);

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [sensorName, dataType, liveMode, sensorType]);

    // Fetch static data when live mode is OFF
    useEffect(() => {
        if (!liveMode) fetchData();
    }, [sensorName, dataType, startTime, endTime, liveMode, sensorType]);

    return (
        <div className="chart-container" style={{ width: "100%", height: "270px" }}>
            <h2>  {sensorName} - {liveMode ? "Live Data" : "Historical Data"} 
            {sensorType === "DHT" && ` - ${dataType}`}</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ProjectChart;
