let jsonData = null;
let allLabels = [];
let allValues = [];
let allAreas = [];
let chart = null;
let xLabel = "";
let yLabel = "";

document.getElementById('inputExcel').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Asignar los nombres de los ejes según los encabezados del archivo Excel
        xLabel = jsonData[0][0]; // Asumiendo que la primera columna es la fecha
        yLabel = jsonData[0][1]; // Asumiendo que la segunda columna es el valor

        allLabels = jsonData.slice(1).map(row => {
            const serial = row[0];
            const date = new Date((serial - (25567 + 1)) * 86400 * 1000);
            return date;
        });

        allValues = jsonData.slice(1).map(row => row[1]);
        allAreas = jsonData.slice(1).map(row => row[2]);

        // Habilitar botones y selectores
        document.getElementById('generateChart').disabled = false;
        document.getElementById('chartType').disabled = false;
        document.getElementById('yearFilter').disabled = false;
        document.getElementById('monthFilter').disabled = false;
        document.getElementById('areaFilter').disabled = false;

        // Poblar los filtros de año y área
        populateYearFilter(allLabels);
        populateAreaFilter(allAreas);
    };

    reader.readAsArrayBuffer(file);
});

document.getElementById('generateChart').addEventListener('click', function () {
    filterAndGenerateChart();
});

document.getElementById('updateChart').addEventListener('click', function () {
    filterAndGenerateChart();
});

function filterAndGenerateChart() {
    const yearFilter = document.getElementById('yearFilter').value;
    const monthFilter = document.getElementById('monthFilter').value;
    const areaFilter = document.getElementById('areaFilter').value;

    const filteredLabels = [];
    const filteredValues = [];

    for (let i = 0; i < allLabels.length; i++) {
        const date = allLabels[i];
        const area = allAreas[i];
        if ((yearFilter === "" || date.getFullYear() == yearFilter) &&
            (monthFilter === "" || date.getMonth() + 1 == monthFilter) &&
            (areaFilter === "" || area === areaFilter)) {
            filteredLabels.push(date);
            filteredValues.push(allValues[i]);
        }
    }

    generateChart(filteredLabels, filteredValues);
}

function generateChart(labels, values) {
    const chartType = document.getElementById('chartType').value;
    const formattedLabels = labels.map(date => date.toISOString().split('T')[0]);

    const ctx = document.getElementById('myChart').getContext('2d');
    if (chart) {
        chart.destroy();
    }
    chart = new Chart(ctx, {
        type: chartType,
        data: {
            labels: formattedLabels,
            datasets: [{
                label: yLabel,
                data: values,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xLabel
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: yLabel
                    },
                    beginAtZero: true
                }
            },
            plugins: {
                datalabels: {
                    anchor: 'end',
                    align: 'top',
                    formatter: function(value, context) {
                        return value.toFixed(2);
                    }
                }
            }
        },
        plugins: [ChartDataLabels]
    });
}

function populateYearFilter(dates) {
    const yearFilter = document.getElementById('yearFilter');
    const years = [...new Set(dates.map(date => date.getFullYear()))];

    years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    });

    document.getElementById('updateChart').disabled = false;
}

function populateAreaFilter(areas) {
    const areaFilter = document.getElementById('areaFilter');
    const uniqueAreas = [...new Set(areas)];

    uniqueAreas.forEach(area => {
        const option = document.createElement('option');
        option.value = area;
        option.textContent = area;
        areaFilter.appendChild(option);
    });

    document.getElementById('updateChart').disabled = false;
}
