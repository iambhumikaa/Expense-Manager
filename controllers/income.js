import Income from '../models/income.js';

export const renderIncomeFile = async (req, res) => {
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

        const incomeList = await Income.find({ userId, date: { $gte: startDate, $lte: endDate }, }).sort({ date: -1 });

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        const selectedMonthsName = monthNames[selectedMonth];

        res.render("income", { incomeList, monthNames, selectedMonth, selectedMonthsName });
    } catch (error) {
        console.error("Fetching error:", error);
        res.status(500).send("Error Fetching File.");
    }
}

export const handleIncome = async (req, res) => {
    try {
        const { category, amount, description, date } = req.body;
        const userId = req.user.id;
        const newIncome = new Income({ userId, category, amount, date, description });
        await newIncome.save();

        return res.redirect("/income");

    } catch (error) {
        console.error("Error adding income:", error);
        res.status(500).send("Error adding income.");
    }
}

export const renderEditIncomePage = async (req, res) => {
    try {
        const { id } = req.params;
        const income = await Income.findOne({ _id: id });
        res.render("editIncome", { income });
    } catch (error) {
        console.error("Fetching error:", error);
        res.status(500).send("Error Fetching File.");
    }
}

export const updateIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { category, amount, description, date } = req.body;
        const updated = await Income.findByIdAndUpdate(id,
            { category, amount, description, date },
            { new: true });

        if (!updated) {
            return res.status(404).send("Error finding income.");
        }

        return res.redirect("/income");

    } catch (error) {
        console.error("Error updating income:", error);
        res.status(500).send("Error updating income.");
    }
}

export const deleteIncome = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const deleted = await Income.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).send("Error finding income");
        }

        return res.redirect("/income");

    } catch (error) {
        console.error("Error deleting income:", error);
        res.status(500).send("Error deleting income.");
    }
}
