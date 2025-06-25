import express from "express";
import bodyParser from "body-parser";
import env from "dotenv";
import authRouter from './routes/user.js';
import expenseRouter from './routes/expense.js';
import incomeRouter from './routes/income.js';
import renderRouter from './routes/pageRender.js'
import {connectMongoDB} from './config/db.js';
import cookieParser from "cookie-parser";
import methodOverride from "method-override";

env.config();

const port = process.env.PORT;
const app = express();
const url = process.env.MONGODB_URL;

// middlewares
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(methodOverride('_method'));

// Routes
app.use("/", authRouter);
app.use("/expense", expenseRouter);
app.use("/income", incomeRouter);
app.use("/", renderRouter);

// db connection and listen server on localhost
connectMongoDB(url).then(() => {
    console.log('MongoDB Connected');
    app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
  })
  .catch(err => console.log(err));
