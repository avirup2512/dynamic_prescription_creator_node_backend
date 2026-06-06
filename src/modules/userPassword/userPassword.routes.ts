import express from "express";
import UserPasswordController from "./userPassword.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { userPasswordCreateSchema, userPasswordUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(userPasswordCreateSchema, "body"), UserPasswordController.create.bind(UserPasswordController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), UserPasswordController.list.bind(UserPasswordController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), UserPasswordController.getById.bind(UserPasswordController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(userPasswordUpdateSchema, "body"), UserPasswordController.update.bind(UserPasswordController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), UserPasswordController.remove.bind(UserPasswordController));

export default router;
