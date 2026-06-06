import express from "express";
import TemplateController from "./template.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateCreateSchema, templateUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateCreateSchema, "body"), TemplateController.createTemplate.bind(TemplateController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateController.getAllTemplates.bind(TemplateController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateController.getAllTemplateInfoById.bind(TemplateController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateUpdateSchema, "body"), TemplateController.update.bind(TemplateController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateController.remove.bind(TemplateController));

export default router;
