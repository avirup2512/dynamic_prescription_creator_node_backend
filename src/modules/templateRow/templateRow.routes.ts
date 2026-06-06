import express from "express";
import TemplateRowController from "./templateRow.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateRowCreateSchema, templateRowUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateRowCreateSchema, "body"), TemplateRowController.create.bind(TemplateRowController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateRowController.list.bind(TemplateRowController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateRowController.getById.bind(TemplateRowController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateRowUpdateSchema, "body"), TemplateRowController.update.bind(TemplateRowController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateRowController.remove.bind(TemplateRowController));

export default router;
