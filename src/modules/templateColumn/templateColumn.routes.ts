import express from "express";
import TemplateColumnController from "./templateColumn.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateColumnCreateSchema, templateColumnUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateColumnCreateSchema, "body"), TemplateColumnController.create.bind(TemplateColumnController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateColumnController.list.bind(TemplateColumnController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateColumnController.getById.bind(TemplateColumnController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateColumnUpdateSchema, "body"), TemplateColumnController.update.bind(TemplateColumnController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateColumnController.remove.bind(TemplateColumnController));

export default router;
