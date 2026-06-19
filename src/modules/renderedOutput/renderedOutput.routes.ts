import express from "express";
import RenderedOutputController from "./renderedOutput.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { renderedOutputCreateSchema, renderedOutputUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(renderedOutputCreateSchema, "body"), RenderedOutputController.create.bind(RenderedOutputController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), RenderedOutputController.list.bind(RenderedOutputController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), RenderedOutputController.getById.bind(RenderedOutputController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(renderedOutputUpdateSchema, "body"), RenderedOutputController.update.bind(RenderedOutputController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), RenderedOutputController.remove.bind(RenderedOutputController));
router.post("/generatePdf", authMiddleware, validateRequest(idParamSchema, "params"), RenderedOutputController.generatePdf.bind(RenderedOutputController));

export default router;
