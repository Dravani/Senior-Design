import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(duration);
dayjs.extend(customParseFormat);

Chart.register(...registerables);

import "./ProjectChart.css";

const generateRandomColor = () => {
    const h = Math.floor(Math.random() * 360);
    const s = 70;
    const l = 60;
    return `hsl(${h}, ${s}%, ${l}%)`;
};

const ProjectChart = ({ sensorNames = [], dataType, liveMode, startTime, endTime, sensorType, isFullScreen }) => {
    const [showOverlay, setShowOverlay] = useState(true);
    const [relativeTimeMode, setRelativeTimeMode] = useState(true);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    const wsRef = useRef(null);
    const sensorColorMapRef = useRef({});

    useEffect(() => {
        const map = sensorColorMapRef.current;
        sensorNames.forEach((name) => {
            if (!map[name]) {
                map[name] = generateRandomColor();
            }
        });
    }, [JSON.stringify(sensorNames)]);

    const options = {
        responsive: true,
        plugins: {
            legend: { display: true },
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
                    font: { size: 14, weight: "bold" },
                },
                ticks: {
                    callback: (val, index) => {
                        const timestamp = chartData.labels[index];
                        if (!timestamp) return "";

                        if (isFullScreen) {
                            if (relativeTimeMode && chartData.labels.length > 0) {
                                const start = dayjs(chartData.labels[0]);
                                const current = dayjs(timestamp);
                                const diffMs = current.diff(start);
                                const d = dayjs.duration(diffMs);
                                return d.asHours() >= 1 ? d.format("H:mm:ss") : d.format("m:ss");
                            } else {
                                return dayjs(timestamp).format("HH:mm:ss");
                            }
                        }
                        return "";
                    },
                    color: "#ccc",
                    autoSkip: false,
                },
                grid: { color: "rgba(255,255,255,0.1)" },
            },
            y: {
                title: {
                    display: true,
                    text: sensorType === "DHT"
                        ? dataType === "humidity" ? "Humidity (%)" : "Temperature (°C)"
                        : "Packet Length (bytes)",
                    color: "#ccc",
                    font: { size: 14, weight: "bold" },
                },
                ticks: { beginAtZero: true, color: "#ccc" },
                grid: { color: "rgba(255,255,255,0.1)" },
            },
        },
    };

    const firstTimestamp = chartData.labels[0]
        ? dayjs(chartData.labels[0]).format("ddd MMM D, HH:mm:ss")
        : null;

    const fetchData = async () => {
        if (!sensorNames.length || liveMode) return;

        try {
            const datasets = [];
            let commonLabels = [];

            for (const sensorName of sensorNames) {
                let url = "";

                if (sensorType === "DHT") {
                    url = `http://localhost:3000/api/sensors/read/${sensorName}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}&type=${dataType}`;
                } else if (sensorType === "Network") {
                    url = `http://localhost:3000/api/sensors/network/read/${sensorName}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;
                } else {
                    console.warn("Unknown sensor type:", sensorType);
                    continue;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error(`Fetch failed for ${sensorName}`);
                const data = await res.json();

                if (!commonLabels.length) {
                    commonLabels = data.labels;
                }

                datasets.push({
                    label: `${sensorName} (${sensorType === "DHT" ? dataType : "Packet"})`,
                    data: data.values,
                    borderColor: sensorColorMapRef.current[sensorName],
                    borderWidth: 2,
                    fill: false,
                });
            }

            setChartData({ labels: commonLabels, datasets });
        } catch (err) {
            console.error("Error fetching multi-sensor data:", err);
        }
    };

    useEffect(() => {
        if (!sensorNames.length || !liveMode) return;

        const sensorName = sensorNames[0];
        let socketUrl = "";

        if (sensorType === "DHT") {
            socketUrl = `ws://localhost:8080/readings/${sensorName}`;
        } else if (sensorType === "Network") {
            socketUrl = `ws://localhost:8080/network/${sensorName}`;
        }

        const socket = new WebSocket(socketUrl);
        wsRef.current = socket;

        socket.onopen = () => console.log(`Connected to WebSocket: ${sensorName}`);
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log("Live data received:", data);

                setChartData((prev) => ({
                    labels: [...prev.labels, new Date().toISOString()],
                    datasets: prev.datasets.map((dataset, i) => ({
                        ...dataset,
                        borderColor: sensorColorMapRef.current[sensorNames[i]],
                        data: i === 0
                            ? [...dataset.data, sensorType === "DHT" ? data[dataType] : data["packet_length"]]
                            : dataset.data
                    }))
                }));
            } catch (err) {
                console.error("Error parsing WS data:", err);
            }
        };

        socket.onclose = () => console.log(`WebSocket closed: ${sensorName}`);
        socket.onerror = (e) => console.error("WebSocket error:", e);

        return () => {
            socket.close();
            wsRef.current = null;
        };
    }, [sensorNames, dataType, liveMode, sensorType]);

    useEffect(() => {
        if (!liveMode) fetchData();
    }, [JSON.stringify(sensorNames), dataType, startTime, endTime, liveMode, sensorType]);

    const chartStyle = isFullScreen
        ? { width: "100%", height: "100%" }
        : { width: "100%", height: "270px" };

    return (
        <div className="chart-container" style={chartStyle}>
            {!isFullScreen ? (
                <>
                    <h2 className="title-chart">
                        {sensorNames.join(", ")} - {liveMode ? "Live" : "Historical"} Data
                        {sensorType === "DHT" && ` - ${dataType}`}
                    </h2>
                    {firstTimestamp && (
                        <div className="chart-header">First Timestamp: {firstTimestamp}</div>
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
                            <strong>{sensorNames.join(", ")}</strong><br />
                            {liveMode ? "Live Data" : "Historical Data"}<br />
                            {sensorType === "DHT" && `${dataType}`}<br />
                            {firstTimestamp && <span>First: {firstTimestamp}</span>}
                        </div>
                    )}
                </>
            )}
            <Line data={chartData} options={options} />
        </div>
    );
};

export default ProjectChart;
