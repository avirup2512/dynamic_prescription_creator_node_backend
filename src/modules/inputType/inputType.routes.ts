import express from "express";
import InputTypeController from "./inputType.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { inputTypeCreateSchema, inputTypeUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(inputTypeCreateSchema, "body"), InputTypeController.create.bind(InputTypeController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), InputTypeController.list.bind(InputTypeController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputTypeController.getById.bind(InputTypeController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(inputTypeUpdateSchema, "body"), InputTypeController.update.bind(InputTypeController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputTypeController.remove.bind(InputTypeController));

export default router;
