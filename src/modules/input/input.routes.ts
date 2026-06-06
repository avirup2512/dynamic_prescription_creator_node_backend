import express from "express";
import InputController from "./input.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { inputCreateSchema, inputUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(inputCreateSchema, "body"), InputController.create.bind(InputController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), InputController.list.bind(InputController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputController.getById.bind(InputController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(inputUpdateSchema, "body"), InputController.update.bind(InputController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputController.remove.bind(InputController));

export default router;
