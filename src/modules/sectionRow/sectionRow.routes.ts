import express from "express";
import SectionRowController from "./sectionRow.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { sectionRowCreateSchema, sectionRowUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(sectionRowCreateSchema, "body"), SectionRowController.create.bind(SectionRowController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), SectionRowController.list.bind(SectionRowController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), SectionRowController.getById.bind(SectionRowController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(sectionRowUpdateSchema, "body"), SectionRowController.update.bind(SectionRowController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), SectionRowController.remove.bind(SectionRowController));

export default router;
