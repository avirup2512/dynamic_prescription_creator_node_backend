import express from "express";
import AuthController from "./auth.controller"
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

router.post("/register",  AuthController.register.bind(AuthController));
router.post("/login",  AuthController.login.bind(AuthController));
router.post("/forgot-password", authMiddleware, AuthController.forgotPassword.bind(AuthController));
router.post("/reset-password", authMiddleware,  AuthController.resetPassword.bind(AuthController));
router.get("/me", authMiddleware, AuthController.verifyMe.bind(AuthController));
router.get("/logout",authMiddleware, AuthController.logout.bind(AuthController))
export default router;