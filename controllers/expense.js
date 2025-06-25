import Expense from '../models/expense.js';

export const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

export const renderExpenseFile = async (req, res) => {
    try {
        const userId = req.user.id;
        if (!userId) {
            return res.status(401).send("User not logged in");
        }
        const selectedMonth = parseInt(req.query.month);
        const selectedYear = parseInt(req.query.year);
        console.log(selectedMonth, selectedYear);

        const year = !isNaN(selectedYear) ? selectedYear : new Date().getFullYear();
        const month = !isNaN(selectedMonth) ? selectedMonth : new Date().getMonth();

        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0, 23, 59, 59);

        const expenses = await Expense.find({ userId, date: { $gte: startDate, $lte: endDate }, }).sort({ date: -1 });

        const selectedMonthsName = monthNames[selectedMonth];

        res.render("expense", {expenses, monthNames, selectedMonth, selectedMonthsName});

    } catch (error) {
        console.error("Fetching error:", error);
        res.status(500).send("Error Fetching File.");
    }
}

export const handleExpense = async (req, res) => {
    try {
        const { category, amount, description, date } = req.body;
        const userId = req.user.id;
        const newExpense = new Expense({ userId, category, amount, date, description });
        await newExpense.save();

        return res.redirect("/expense");

    } catch (error) {
        console.error("Error adding expense:", error);
        res.status(500).send("Error adding expense.");
    }
}

export const renderEditExpensePage = async (req, res) => {
    try {
        const { id } = req.params;
        const expense = await Expense.findOne({ _id: id });
        res.render("editExpense", { expense });
    } catch (error) {
        console.error("Fetching error:", error);
        res.status(500).send("Error Fetching File.");
    }
}

export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { category, amount, description, date } = req.body;
        const updated = await Expense.findByIdAndUpdate(id,
            { category, amount, description, date },
            { new: true });

        if (!updated) {
            return res.status(404).send("Error finding expense.");
        }

        return res.redirect("/expense");

    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).send("Error updating expenses.");
    }
}

export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deleted = await Expense.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).send("Error finding expense");
        }

        return res.redirect("/expense");

    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).send("Error deleting expenses.");
    }
}
