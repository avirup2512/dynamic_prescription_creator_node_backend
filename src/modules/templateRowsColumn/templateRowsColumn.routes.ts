import express from "express";
import TemplateRowsColumnController from "./templateRowsColumn.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { templateRowsColumnCreateSchema, templateRowsColumnUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(templateRowsColumnCreateSchema, "body"), TemplateRowsColumnController.create.bind(TemplateRowsColumnController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), TemplateRowsColumnController.list.bind(TemplateRowsColumnController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateRowsColumnController.getById.bind(TemplateRowsColumnController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(templateRowsColumnUpdateSchema, "body"), TemplateRowsColumnController.update.bind(TemplateRowsColumnController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), TemplateRowsColumnController.remove.bind(TemplateRowsColumnController));

export default router;
