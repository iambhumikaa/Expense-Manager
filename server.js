import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";
import env from "dotenv";
import connectPgSimple from "connect-pg-simple";
import pkg from "pg";

const { Pool } = pkg;
const port = 3000;
const app = express();
const saltRounds = 10;
const pgSession = connectPgSimple(session);
env.config();

app.use(
    session({
        secret: process.env.SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24, // 1 day
        }
    })
);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: 5432,
});
db.connect();

app.use(passport.initialize());
app.use(passport.session());

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/aboutUs", (req, res) => {
    res.render("aboutUs");
});

app.get("/dashboard", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const userId = req.session.userId;
            // for fetching expenses data
            const expenseResult = await db.query(
                `SELECT category, amount FROM expenses WHERE user_id = $1`,
                [userId]
            );
            const expenses = expenseResult.rows;
            // console.log("Expenses being sent to dashboard:", expenses);

            // for fetching income data
            const incomeResult = await db.query(
                `SELECT title, amount FROM income WHERE user_id = $1`,
                [userId]
            );
            const income = incomeResult.rows;
            // console.log("Incomes being sent to dashboard:", income);  

            res.render("dashboard", { expenses, income });

        } catch (err) {
            console.error("Error fetching expenses:", err);
            res.status(500).send("Server error");
        }
    } else {
        res.redirect("/login");
    }
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/logout", (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
});

app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log("Authentication failed:", info ? info.message : "No user found");
            return res.redirect("/login");
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            req.session.userId = user.id;
            console.log("User logged in, Session User ID:", req.session.userId);
            return res.redirect("/dashboard");
        });
    })(req, res, next);
});

app.post("/signup", async (req, res) => {
    const email = req.body.userEmail;
    const plainTextPassword = req.body.password;

    try {
        const checkResult = await db.query("SELECT * FROM websiteusers WHERE email = $1", [email]);

        if (checkResult.rows.length > 0) {
            res.redirect("/login");
        } else {
            bcrypt.hash(plainTextPassword, saltRounds, async (err, hash) => {
                if (err) {
                    console.error("Error hashing password:", err);
                } else {
                    const result = await db.query(
                        "INSERT INTO websiteusers (email, password) VALUES ($1, $2) RETURNING *",
                        [email, hash]
                    );
                    const user = result.rows[0];
                    req.login(user, (err) => { });
                }
                console.log("Success");
                res.render("dashboard");
            });
        }
    } catch (dbError) {
        console.log("Database Error.");
    }
});

passport.use(
    new Strategy(
        { usernameField: "userEmail", passwordField: "password" },
        async function verify(userEmail, password, cb) {
            console.log("Authenticating user:", userEmail);
            try {
                const result = await db.query("SELECT * FROM websiteusers WHERE email = $1", [userEmail]);

                if (result.rows.length === 0) {
                    console.log("User not found");
                    return cb(null, false, { message: "User not found" });
                }

                const user = result.rows[0];
                // console.log("User found:", user);

                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    console.log("Password match successful");
                    return cb(null, user);
                } else {
                    console.log("Incorrect password");
                    return cb(null, false, { message: "Incorrect Password" });
                }
            } catch (err) {
                console.error("Error during authentication:", err);
                return cb(err);
            }
        }
    )
);

passport.serializeUser((user, cb) => {
    cb(null, user.id);
});
passport.deserializeUser(async (id, cb) => {
    try {
        const result = await db.query("SELECT * FROM websiteusers WHERE id = $1", [id]);
        cb(null, result.rows[0]);
    } catch (err) {
        cb(err);
    }
});

// render Expense page
app.get("/expense", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(403).send("Unauthorized");
        }

        // console.log("User ID:", req.session.userId);
        const result = await db.query("SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC", [
            req.session.userId,
        ]);

        res.render("expense", { expenses: result.rows });
    } catch (err) {
        console.error("Error fetching expenses:", err);
        res.status(500).send("Error fetching expenses");
    }
});

// add expenses into db
app.post("/add-expense", async (req, res) => {
    console.log("Received Form Data:", req.body);

    const { category, amount, description, date } = req.body;
    console.log("Session User ID:", req.session.userId);

    try {
        if (!req.session.userId) {
            return res.status(403).send("Unauthorized");
        }

        await db.query(
            "INSERT INTO expenses (user_id, category, amount, date, description) VALUES ($1, $2, $3, $4, $5)",
            [req.session.userId, category, amount, date, description]
        );

        res.redirect("/expense");
    } catch (err) {
        console.error("Error adding expense:", err);
        res.status(500).send("Error adding expense");
    }
});

// render Income Page
app.get("/income", async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(403).send("Unauthorized");
        }

        // console.log("User ID:", req.session.userId);
        const result = await db.query("SELECT * FROM income WHERE user_id = $1 ORDER BY date DESC", [
            req.session.userId,
        ]);
        const totalIncomeResult = await db.query("SELECT SUM(amount) AS total FROM income WHERE user_id = $1", [req.session.userId]);
        const totalIncome = totalIncomeResult.rows[0].total || 0;

        res.render("income", { incomeList: result.rows, totalIncome });
    } catch (err) {
        console.error("Error fetching incomes:", err);
        res.status(500).send("Error fetching incomes");
    }
});

// Add Income to db
app.post("/add-income", async (req, res) => {
    console.log("Received Form Data:", req.body);

    const { title, amount, description, date } = req.body;
    console.log("Session User ID:", req.session.userId);

    try {
        if (!req.session.userId) {
            return res.status(403).send("Unauthorized");
        }
        await db.query(
            "INSERT INTO income (user_id, title, amount, description, date ) VALUES ($1, $2, $3, $4, $5)",
            [req.session.userId, title, amount, description, date]
        );
        res.redirect("/income");
    } catch (err) {
        console.error("Error adding income:", err);
        res.status(500).send("Error adding income");
    }
});

// route to delete expense entries
app.post("/delete-expense/:id", async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.session.userId;
    // console.log("expense id= ", expenseId);
    // console.log(`userId for expense delete = ${userId} `); 

    try {
        await db.query("DELETE FROM expenses WHERE id=$1 AND user_id=$2;", [expenseId, userId]);
        const restRows = await db.query("SELECT * FROM expenses WHERE user_id = $1;", [userId]);
        const expenses = restRows.rows;
        res.render("expense", { expenses });
        // res.status(200).send("Deletion successful!");

    } catch (error) {
        console.log("Expense not found", error);
        res.status(500).send("Internal server error");
    }

});

// route to show edit expenses form
app.get("/edit-expense-form/:id", async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.session.userId;
    try {
        const result = await db.query(
            'SELECT * FROM expenses WHERE id = $1 AND user_id = $2',
            [expenseId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('Expense not found or unauthorized.');
        }

        res.render('editExpense', { expense: result.rows[0] });

    } catch (error) {
        console.error('Error loading expense for edit:', error);
        res.status(500).send('Internal Server Error');
    }
})

// route to update through edit expenses
app.post("/update-expense/:id", async (req, res) => {
    const expenseId = req.params.id;
    const userId = req.session.userId;
    const { category, description, amount, date } = req.body;
    try {
        await db.query("UPDATE expenses SET category = $1, description = $2, amount = $3, date = $4 WHERE id = $5 AND user_id = $6",
            [category, description, amount, date, expenseId, userId]);
        const result = await db.query("SELECT * FROM expenses WHERE id=$1 AND user_id=$2", [expenseId, userId]);
        const expenses = result.rows;
        console.log(result);
        res.render("expense", { expenses });
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).send('Internal Server Error');
    }
})

// route to delete expense entries
app.post("/delete-income/:id", async (req, res) => {
    const incomeId = req.params.id;
    const userId = req.session.userId;
    // console.log("income id= ", incomeId);
    // console.log(`userId for income delete = ${userId} `); 

    try {
        await db.query("DELETE FROM income WHERE id=$1 AND user_id=$2;", [incomeId, userId]);
        const restRows = await db.query("SELECT * FROM income WHERE user_id = $1;", [userId]);
        const incomeList = restRows.rows;
        const totalIncome = incomeList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
        res.render("income", { incomeList, totalIncome });

    } catch (error) {
        console.log("Income not found", error);
        res.status(500).send("Internal server error");
    }
});

// route to show edit income form
app.get("/edit-income-form/:id", async (req, res) => {
    const incomeId = req.params.id;
    const userId = req.session.userId;
    try {
        const result = await db.query(
            'SELECT * FROM income WHERE id = $1 AND user_id = $2',
            [incomeId, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).send('income not found or unauthorized.');
        }

        res.render('editIncome', { income: result.rows[0] });

    } catch (error) {
        console.error('Error loading income for edit:', error);
        res.status(500).send('Internal Server Error');
    }
})

// route to update through edit income
app.post("/update-income/:id", async (req, res) => {
    const incomeId = req.params.id;
    const userId = req.session.userId;
    const { title, description, amount, date } = req.body;
    try {
        await db.query("UPDATE income SET title = $1, description = $2, amount = $3, date = $4 WHERE id = $5 AND user_id = $6",
            [title, description, amount, date, incomeId, userId]);

        const result = await db.query("SELECT * FROM income WHERE user_id = $1", [userId]);
        const incomeList = result.rows;
        const totalIncome = incomeList.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);

        res.render("income", { incomeList, totalIncome });
        res.render("income", { incomeList });

    } catch (error) {
        console.error('Error updating income:', error);
        res.status(500).send('Internal Server Error');
    }
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});