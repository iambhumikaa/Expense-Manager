import express from 'express';
import { renderAboutUs, renderDashboard, renderLandingPage } from '../controllers/pageRender.js';
import { requireAuth } from '../middlewares/auth.js';

const router = express.Router();

router.get("/", renderLandingPage);
router.get("/aboutUs", renderAboutUs );
router.get("/dashboard",requireAuth, renderDashboard );

export default router;