import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { subscribeToSensor } from "../tools/SocketManager";
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

const ProjectChart = ({ sensorNames = [], dataType, liveMode, startTime, endTime, sensorType, isFullScreen, onDataUpdate }) => {
    const [showOverlay, setShowOverlay] = useState(true);
    const [relativeTimeMode, setRelativeTimeMode] = useState(true);
    const [chartData, setChartData] = useState({ labels: [], datasets: [] });

    const wsRef = useRef(null);
    const chartDataRef = useRef(chartData);
    const sensorColorMapRef = useRef({});

    useEffect(() => {
        const map = sensorColorMapRef.current;
        sensorNames.forEach((name) => {
            if (!map[name]) {
                map[name] = generateRandomColor();
            }
        });
    }, [JSON.stringify(sensorNames)]);

    useEffect(() => {
        if (typeof onDataUpdate === 'function') {
            onDataUpdate(chartData);
        }
    }, [chartData]);

    useEffect(() => {
        if (!liveMode || !sensorNames.length) return;

        setChartData((prev) => {
            if (prev.datasets.length > 0) return prev;

            const datasets = sensorNames.map((name) => ({
                label: `${name} (${sensorType === "DHT" ? dataType : "Packet"})`,
                sensorName: name,
                data: [],
                borderColor: sensorColorMapRef.current[name],
                borderWidth: 2,
                fill: false,
                spanGaps: true,
            }));

            return { labels: [], datasets };
        });
    }, [liveMode, JSON.stringify(sensorNames), dataType, sensorType]);

    useEffect(() => {
        chartDataRef.current = chartData;
    }, [chartData]);
    
    const options = {
        responsive: true,
        plugins: {
            legend: { display: true },
            tooltip: {
                callbacks: {
                    title: (tooltipItems) => {
                        const index = tooltipItems[0].dataIndex;
                        const datasetIndex = tooltipItems[0].datasetIndex;
                        const timestamp = chartData.datasets[datasetIndex].timestamps?.[index];
                        return timestamp ? dayjs(timestamp).format("ddd MMM D, HH:mm:ss") : '';
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

    const firstTimestamps = chartData.datasets.map(dataset =>
        dataset.timestamps?.[0] ? dayjs(dataset.timestamps[0]).format("ddd MMM D, HH:mm:ss") : null
    );

    const fetchData = async () => {
        if (!sensorNames.length || liveMode) return;

        try {
            const datasets = [];
            let allTimestamps = new Set();

            const sensorDataPromises = sensorNames.map(async (sensorName) => {
                let url = "";
                if (sensorType === "DHT") {
                    url = `http://localhost:3000/api/sensors/read/${sensorName}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}&type=${dataType}`;
                } else if (sensorType === "Network") {
                    url = `http://localhost:3000/api/sensors/network/read/${sensorName}?start=${encodeURIComponent(startTime)}&end=${encodeURIComponent(endTime)}`;
                } else {
                    console.warn("Unknown sensor type:", sensorType);
                    return null;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error(`Fetch failed for ${sensorName}`);
                const data = await res.json();
                return { sensorName, labels: data.labels, values: data.values };
            });

            const sensorDataResults = await Promise.all(sensorDataPromises);

            sensorDataResults.forEach(sensorData => {
                if (!sensorData) return;
                sensorData.labels.forEach(label => allTimestamps.add(label));
            });

            const sortedTimestamps = Array.from(allTimestamps).sort();

            sensorDataResults.forEach(sensorData => {
                if (!sensorData) return;
                const dataPoints = new Array(sortedTimestamps.length).fill(undefined);
                const timestamps = new Array(sortedTimestamps.length).fill(undefined);

                const sensorTimestampMap = sensorData.labels.reduce((acc, label, index) => {
                    acc[label] = sensorData.values[index];
                    return acc;
                }, {});

                sortedTimestamps.forEach((timestamp, index) => {
                    if (sensorTimestampMap[timestamp] !== undefined) {
                        dataPoints[index] = sensorTimestampMap[timestamp];
                        timestamps[index] = timestamp;
                    }
                });

                datasets.push({
                    label: `${sensorData.sensorName} (${sensorType === "DHT" ? dataType : "Packet"})`,
                    sensorName: sensorData.sensorName,
                    data: dataPoints,
                    timestamps: timestamps,
                    borderColor: sensorColorMapRef.current[sensorData.sensorName],
                    borderWidth: 2,
                    fill: false,
                    spanGaps: true
                });
            });

            setChartData({ labels: sortedTimestamps, datasets });

        } catch (err) {
            console.error("Error fetching multi-sensor data:", err);
        }
    };

    useEffect(() => {
        if (!liveMode || !sensorNames.length) return;
    
        const unsubscribers = sensorNames.map(sensorName => {
            return subscribeToSensor(sensorName, sensorType, (data) => {
                const timestamp = new Date().toISOString();
    
                setChartData(prev => {
                    const updatedLabels = [...prev.labels, timestamp];
                    const updatedDatasets = prev.datasets.map((dataset) => {
                        if (dataset.sensorName === sensorName) {
                            const newData = [...dataset.data, sensorType === "DHT" ? data[dataType] : data.packet_length];
                            const newTimestamps = [...(dataset.timestamps || []), timestamp];
                            return { ...dataset, data: newData, timestamps: newTimestamps };
                        }
                        return dataset;
                    });
    
                    return { labels: updatedLabels, datasets: updatedDatasets };
                });
            });
        });
    
        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [liveMode, sensorNames, dataType, sensorType]);
    

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
                    {firstTimestamps.some(ts => ts) && (
                        <div className="chart-header">
                            First Timestamps: {firstTimestamps.map((ts, index) => ts && `${sensorNames[index]}: ${ts}`).filter(Boolean).join(", ")}
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
                            <strong>{sensorNames.join(", ")}</strong><br />
                            {liveMode ? "Live Data" : "Historical Data"}<br />
                            {sensorType === "DHT" && `${dataType}`}<br />
                            {firstTimestamps.some(ts => ts) && (
                                <span>First: {firstTimestamps.map((ts, index) => ts && `${sensorNames[index]}: ${ts}`).filter(Boolean).join(", ")}</span>
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