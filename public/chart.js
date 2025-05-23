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
        const title = item.title;
        const amount = Number(item.amount);
        if (grouped[title]) {
            grouped[title] += amount;
        } else {
            grouped[title] = amount;
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
    const data = Object.values(groupedExpenses);

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
