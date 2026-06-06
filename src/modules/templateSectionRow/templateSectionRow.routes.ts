import express from "express";
import TemplateSectionRowController from "./templateSectionRow.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateSectionRowCreateSchema, templateSectionRowUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateSectionRowCreateSchema, "body"), TemplateSectionRowController.create.bind(TemplateSectionRowController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateSectionRowController.list.bind(TemplateSectionRowController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateSectionRowController.getById.bind(TemplateSectionRowController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateSectionRowUpdateSchema, "body"), TemplateSectionRowController.update.bind(TemplateSectionRowController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateSectionRowController.remove.bind(TemplateSectionRowController));

export default router;
