import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import dayjs from "dayjs";
import duration from 'dayjs/plugin/duration';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(duration);
dayjs.extend(customParseFormat);

Chart.register(...registerables);

// CSS Stylings
import "./ProjectChart.css"

const ProjectChart = ({ sensorName, dataType, liveMode, startTime, endTime, sensorType, isFullScreen}) => {
    const [showOverlay, setShowOverlay] = useState(true);
    const [relativeTimeMode, setRelativeTimeMode] = useState(true);
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
                        const timestamp = chartData.labels[index];
                        if (!timestamp) return "";
    
                        if (isFullScreen) {
                            if (relativeTimeMode && chartData.labels.length > 0) {
                                const start = dayjs(chartData.labels[0]);
                                const current = dayjs(timestamp);
                                const diffMs = current.diff(start); // Total milliseconds
                                const duration = dayjs.duration(diffMs);
                    
                                if (duration.asHours() >= 1) {
                                    return duration.format("H:mm:ss");
                                } else {
                                    return duration.format("m:ss");
                                }
                            } else {
                                return dayjs(timestamp).format("HH:mm:ss");
                            }
                        }
                        return "";
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

    const chartStyle = isFullScreen
    ? { width: "100%", height: "100%" } // Fullscreen size
    : { width: "100%", height: "270px" }; // Normal size

    return (
        <div className="chart-container" style={chartStyle}>
            {!isFullScreen ? (
                <>
                    <h2>
                        {sensorName} - {liveMode ? "Live Data" : "Historical Data"}
                        {sensorType === "DHT" && ` - ${dataType}`}
                    </h2>
                    {firstTimestamp && (
                        <div className="chart-header">
                            First Timestamp: {firstTimestamp}
                        </div>
                    )}
                </>
                ) : (
                <>
                    <div className="chart-controls">
                        <div className="relative-toggle-container" onClick={() => setRelativeTimeMode(prev => !prev)}>
                            <input
                                type="checkbox"
                                checked={relativeTimeMode}
                                onChange={() => setRelativeTimeMode(prev => !prev)}
                            />
                            <span>Relative Time</span>
                        </div>
                        <button
                            className="overlay-toggle-button"
                            onClick={() => setShowOverlay(prev => !prev)}
                        >
                            {showOverlay ? "Hide Info" : "Show Info"}
                        </button>
                    </div>

                    {showOverlay && (
                        <div className="chart-overlay-info">
                            <strong>{sensorName}</strong><br />
                            {liveMode ? "Live Data" : "Historical Data"}<br />
                            {sensorType === "DHT" && `${dataType}`}<br />
                            {firstTimestamp && (
                                <span>First: {firstTimestamp}</span>
                            )}
                        </div>
                    )}
                </>
            )}
            <Line data={chartData} options={options} />
        </div>
    );    
};

export default ProjectChart;
