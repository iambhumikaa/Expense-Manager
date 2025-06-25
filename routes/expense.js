import express from 'express';
import {renderExpenseFile, handleExpense, renderEditExpensePage, updateExpense, deleteExpense} from '../controllers/expense.js'
import { requireAuth } from "../middlewares/auth.js";


const router = express.Router();

router.get("/", requireAuth, renderExpenseFile);
router.post("/", requireAuth, handleExpense);
router
    .get("/:id", requireAuth, renderEditExpensePage)
    .patch("/:id", requireAuth, updateExpense)
    .delete("/:id", requireAuth, deleteExpense);

export default router;    

