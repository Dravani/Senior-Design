import * as XLSX from 'xlsx';

export const exportChartsToExcel = (chartConfigs, chartDataMap, title) => {
    const workbook = XLSX.utils.book_new();

    chartConfigs.forEach((config, index) => {
        const chartData = chartDataMap[index];
        if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
            console.warn(`Chart ${index + 1} has no data.`);
            return;
        }

        const rows = [];
        const headers = ["Timestamp", ...chartData.datasets.map(d => d.label)];
        rows.push(headers);

        chartData.labels.forEach((label, rowIndex) => {
            const row = [label];
            chartData.datasets.forEach(dataset => {
                const value = dataset.data[rowIndex] ?? "";
                row.push(value);
            });
            rows.push(row);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(rows);
        const sheetName = `Chart ${index + 1}`;
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    });

    XLSX.writeFile(workbook, title + ".xlsx");
};
