import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ProjectChart = ({ sensorName, dataType, liveMode, startTime, endTime }) => {
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
            x: { ticks: { display: false }, grid: { display: false } }, // Hide X-axis labels
            y: { ticks: { beginAtZero: true } },
        },
    };

    // Function to fetch historical data (if not in live mode)
    const fetchData = async () => {
        if (!sensorName || liveMode) return;

        try {
            const response = await fetch(
                `http://localhost:3000/api/sensors/read/${sensorName}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}&type=${dataType}`
            );
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

        const socket = new WebSocket(`ws://localhost:8080/readings/${sensorName}`);
        wsRef.current = socket;

        socket.onopen = () => console.log(`Connected to WebSocket for: ${sensorName}`);

        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Live data received:", data);

                setChartData((prev) => ({
                    labels: [...prev.labels.slice(-50), ""], // Hide X-axis labels
                    datasets: [{ ...prev.datasets[0], data: [...prev.datasets[0].data.slice(-50), data[dataType]] }],
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
    }, [sensorName, dataType, liveMode]);

    // Fetch static data when live mode is OFF
    useEffect(() => {
        if (!liveMode) fetchData();
    }, [sensorName, dataType, startTime, endTime, liveMode]);

    return (
        <div>
            <h2>{sensorName} - {liveMode ? "Live Data" : "Historical Data"} - {dataType}</h2>
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ProjectChart;
