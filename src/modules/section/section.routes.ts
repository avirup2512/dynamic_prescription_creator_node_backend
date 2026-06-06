import express from "express";
import SectionController from "./section.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { sectionCreateSchema, sectionUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(sectionCreateSchema, "body"), SectionController.createSection.bind(SectionController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), SectionController.getAllSection.bind(SectionController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), SectionController.getByAllSectionInformationById.bind(SectionController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(sectionUpdateSchema, "body"), SectionController.updateSection.bind(SectionController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), SectionController.remove.bind(SectionController));

export default router;
