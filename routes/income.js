import express from 'express';
import {renderIncomeFile, handleIncome, renderEditIncomePage, updateIncome, deleteIncome} from '../controllers/income.js'
import { requireAuth } from "../middlewares/auth.js";


const router = express.Router();

router.get("/", requireAuth, renderIncomeFile);
router.post("/", requireAuth, handleIncome);
router
    .get("/:id", requireAuth, renderEditIncomePage)
    .patch("/:id", requireAuth, updateIncome)
    .delete("/:id", requireAuth, deleteIncome);

export default router;    

