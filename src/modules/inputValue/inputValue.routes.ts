import express from "express";
import InputValueController from "./inputValue.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { inputValueCreateSchema, inputValueUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(inputValueCreateSchema, "body"), InputValueController.create.bind(InputValueController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), InputValueController.list.bind(InputValueController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputValueController.getById.bind(InputValueController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(inputValueUpdateSchema, "body"), InputValueController.update.bind(InputValueController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputValueController.remove.bind(InputValueController));

export default router;
