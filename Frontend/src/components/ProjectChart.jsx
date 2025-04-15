import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import dayjs from "dayjs";

Chart.register(...registerables);

const ProjectChart = ({ sensorName, dataType, liveMode, startTime, endTime, sensorType }) => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: sensorType === "DHT"
                    ? dataType === "humidity"
                        ? "Humidity (%)"
                        : "Temperature (°C)"
                    : "Packet Length (bytes)",
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
        plugins: {
            legend: {
                display: true,
            },
            tooltip: {
                callbacks: {
                    title: (tooltipItems) => {
                        const index = tooltipItems[0].dataIndex;
                        const timestamp = chartData.labels[index];
                        return dayjs(timestamp).format("ddd MMM D, HH:mm:ss");
                    }
                }
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time",
                    color: "#ccc",
                    padding: { top: 0, bottom: 20 },
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                ticks: {
                    callback: (val, index) => {
                        return index === 0
                            ? "" // Don't show the long first label on the axis
                            : "";
                    },
                    color: "#ccc",
                    autoSkip: false,
                },
                grid: {
                    color: "rgba(255,255,255,0.1)",
                },
            },
            y: {
                title: {
                    display: true,
                    text: chartData.datasets[0].label,
                    color: "#ccc",
                    font: {
                        size: 14,
                        weight: "bold",
                    },
                },
                ticks: {
                    beginAtZero: true,
                    color: "#ccc",
                },
                grid: {
                    color: "rgba(255,255,255,0.1)",
                },
            },
        },
    };

    const firstTimestamp = chartData.labels[0]
        ? dayjs(chartData.labels[0]).format("ddd MMM D, HH:mm:ss")
        : null;

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

            const label = sensorType === "DHT"
                ? dataType === "humidity"
                    ? "Humidity (%)"
                    : "Temperature (°C)"
                : "Packet Length (bytes)";

            setChartData({
                labels: data.labels,
                datasets: [{
                    label,
                    data: data.values,
                    borderColor: "#39D869",
                    borderWidth: 2,
                    fill: false
                }],
            });
        } catch (error) {
            console.error("Error fetching sensor data:", error);
        }
    };

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
                    labels: [...prev.labels, new Date().toISOString()],
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

    useEffect(() => {
        if (!liveMode) fetchData();
    }, [sensorName, dataType, startTime, endTime, liveMode, sensorType]);

    return (
        <div className="chart-container" style={{ width: "100%", height: "270px" }}>
            <h2>
                {sensorName} - {liveMode ? "Live Data" : "Historical Data"}
                {sensorType === "DHT" && ` - ${dataType}`}
            </h2>
            {firstTimestamp && (
                <div style={{
                    color: "#ccc",
                    fontSize: "0.9rem",
                    marginTop: "4px",
                    marginLeft: "10px",
                }}>
                    First Timestamp: {firstTimestamp}
                </div>
            )}
            <Line data={chartData} options={options} />
            

        </div>
    );
};

export default ProjectChart;
