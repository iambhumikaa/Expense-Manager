import express from 'express';
import { renderSignupPage, createUser, deleteUser, renderLoginPage, loginUser, logoutUser } from '../controllers/user.js'

const router = express.Router();

router.get("/signup", renderSignupPage);

router.post("/user", createUser);

router.delete("/user/:id", deleteUser);

router.get("/login", renderLoginPage);

router.post("/login", loginUser);

router.get("/logout", logoutUser);

export default router; 