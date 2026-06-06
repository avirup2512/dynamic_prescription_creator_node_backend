import express from "express";
import UserController from "./user.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { userCreateSchema, userUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(userCreateSchema, "body"), UserController.create.bind(UserController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), UserController.list.bind(UserController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), UserController.getById.bind(UserController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(userUpdateSchema, "body"), UserController.update.bind(UserController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), UserController.remove.bind(UserController));

export default router;
