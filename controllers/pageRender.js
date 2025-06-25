import Expense from '../models/expense.js'
import Income from '../models/income.js'
import User from '../models/user.js'

export const renderLandingPage = async (req, res) => {
    try {
        res.render("landing");
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).send("Error fetching file.");
    }
}

export const renderAboutUs = async (req, res) => {
    try {
        res.render("aboutus");
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).send("Error fetching file.");
    }
}

export const renderDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // get user name
        const user = await User.findById(userId);
        const name = user.userName;

        // getting user input - month and year from browser to server
        const selectedMonth = parseInt(req.query.month);
        const selectedYear = parseInt(req.query.year);
        console.log(selectedMonth, selectedYear);

        const year = !isNaN(selectedYear) ? selectedYear : new Date().getFullYear();
        const month = !isNaN(selectedMonth) ? selectedMonth : new Date().getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const expenses = await Expense.find({ userId, date: { $gte: startDate, $lte: endDate }, }).sort({ date: -1 });
        const income = await Income.find({ userId, date: { $gte: startDate, $lte: endDate }, }).sort({ date: -1 });

        const totalIncome = income.reduce((sum, inc) => sum + inc.amount, 0);
        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const savings = totalIncome - totalExpense;

        const monthNames = ["january", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const selectedMonthsName = monthNames[selectedMonth];
        const monName = monthNames[new Date().getMonth()] ; 
        const defaultMonth = !isNaN(selectedMonthsName) ? selectedMonthsName : monName;

        res.render("dashboard", { expenses, income, name, totalIncome, totalExpense, savings, monthNames, selectedMonth, selectedMonthsName, defaultMonth });
        
    } catch (error) {
        console.error("Error fetching file:", error);
        res.status(500).send("Error fetching file.");
    }
}

