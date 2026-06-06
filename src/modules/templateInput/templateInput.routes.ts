import express from "express";
import TemplateInputController from "./templateInput.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateInputCreateSchema, templateInputUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateInputCreateSchema, "body"), TemplateInputController.create.bind(TemplateInputController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateInputController.list.bind(TemplateInputController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateInputController.getById.bind(TemplateInputController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateInputUpdateSchema, "body"), TemplateInputController.update.bind(TemplateInputController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateInputController.remove.bind(TemplateInputController));

export default router;
