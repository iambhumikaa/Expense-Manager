let chartInstance;

function groupByCategory(dataArray) {
    const grouped = {};

    dataArray.forEach(item => {
        const category = item.category;
        const amount = Number(item.amount);
        if (grouped[category]) {
            grouped[category] += amount;
        } else {
            grouped[category] = amount;
        }
    });

    return grouped;
}

function groupByIncome(dataArray) {
    const grouped = {};

    dataArray.forEach(item => {
        const category = item.category;
        const amount = Number(item.amount);
        if (grouped[category]) {
            grouped[category] += amount;
        } else {
            grouped[category] = amount;
        }
    });

    return grouped;
}

function expenseChart() {
    if (chartInstance) {
        chartInstance.destroy();
    }
    const groupedExpenses = groupByCategory(expensesData);
    const labels = Object.keys(groupedExpenses);
    console.log("expenses:", labels);
    const data = Object.values(groupedExpenses);
    console.log("data:", data);

    const ctx = document.getElementById('myChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Expenses',
                data: data,
                backgroundColor: '#f87171'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function incomeChart() {
    if (chartInstance) {
        chartInstance.destroy();
    }
    const groupedIncome = groupByIncome(incomeData);
    const labels = Object.keys(groupedIncome);
    const data = Object.values(groupedIncome);

    const ctx = document.getElementById('myChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Income',
                data: data,
                backgroundColor: '#4CAF50'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function compareChart() {

    if (chartInstance) {
        chartInstance.destroy();
    }

    const totalExpenses = expensesData.reduce((prev, curr) => prev + Number(curr.amount), 0);
    const totalIncome = incomeData.reduce((prev, curr) => prev + Number(curr.amount), 0);
    const labels = ["Total Expenses", "Total Income"];
    console.log(labels);

    const ctx = document.getElementById('myChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Monthly data',
                data: [totalExpenses, totalIncome],
                backgroundColor: ['#f87171', '#4CAF50'],
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true }
            },
            plugins: {
                title: {
                    display: true,
                    text: 'Monthly Financial Summary',
                    color: '#000',
                    font: {
                        size: 20,
                        weight: 'bold',
                    }
                }
            }
        }
    }
    );
}

// Polar pie chart for expenses of month
const chartCanvas = document.getElementById("expensePolarChart");

const selectedMonths = selMonth;

const groupedExpenses = groupByCategory(expensesData);

const labels = Object.keys(groupedExpenses);
const data = Object.values(groupedExpenses);

const colors = [
    "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
    "#9966FF", "#FF9F40", "#C9CBCF", "#8DFF8A"
];

new Chart(chartCanvas, {
    type: "polarArea",
    data: {
        labels: labels,
        datasets: [{
            label: "This Month's Expenses by Category",
            data: data,
            backgroundColor: colors,
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            r: {
                ticks: {
                    display: false 
                },
                grid: {
                    circular: true
                }
            }
        },
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'center'
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `${context.label}: ₹${context.formattedValue}`;
                    }
                }
            },
            title: {
                display: true,
                text: 'Monthly Expense breakdown',
                color: '#e02a2a',
                font: {
                    size: 15,
                    weight: '400',
                }
            }
        }
    }
});