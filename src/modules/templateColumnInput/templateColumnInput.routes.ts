import express from "express";
import TemplateColumnInputController from "./templateColumnInput.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateColumnInputCreateSchema, templateColumnInputUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateColumnInputCreateSchema, "body"), TemplateColumnInputController.create.bind(TemplateColumnInputController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateColumnInputController.list.bind(TemplateColumnInputController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateColumnInputController.getById.bind(TemplateColumnInputController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateColumnInputUpdateSchema, "body"), TemplateColumnInputController.update.bind(TemplateColumnInputController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateColumnInputController.remove.bind(TemplateColumnInputController));

export default router;
