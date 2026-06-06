import express from "express";
import TemplateSectionController from "./templateSection.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateSectionCreateSchema, templateSectionUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateSectionCreateSchema, "body"), TemplateSectionController.create.bind(TemplateSectionController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateSectionController.list.bind(TemplateSectionController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateSectionController.getById.bind(TemplateSectionController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateSectionUpdateSchema, "body"), TemplateSectionController.update.bind(TemplateSectionController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateSectionController.remove.bind(TemplateSectionController));

export default router;
