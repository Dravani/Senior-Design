import React, { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const ProjectChart = () => {
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                label: "Test Data",
                data: [],
                borderColor: "rgb(75, 192, 192)",
                borderWidth: 2,
                fill: false,
            },
        ],
    });

    const options = {
        responsive: true,
        scales: {
            x: {
                ticks: {
                    display: false,  // Hide X-axis labels
                },
                grid: {
                    display: false,  // Optionally hide grid lines
                },
            },
            y: {
                ticks: {
                    beginAtZero: true,
                },
            },
        },
    };

    useEffect(() => {
        // Simulating fetching data from the backend
        fetch('http://localhost:3000/api/sensors/testDHT')
            .then((res) => res.json())
            .then((data) => {
                setChartData({
                    labels: data.labels,
                    datasets: [
                        {
                            label: "Backend Data",
                            data: data.values, // Y-axis values
                            borderColor: "rgb(255, 99, 132)",
                            borderWidth: 2,
                            fill: false,
                        },
                    ],
                });
            })
            .catch((err) => console.error("Error fetching chart data:", err));
    }, []);

    return (
        <div style={{ width: "600px", margin: "0 auto" }}>
            <h2>Project Chart</h2>
            <Line data={chartData} options={options}/>
        </div>
    );
};

export default ProjectChart;
