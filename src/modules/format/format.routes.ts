import express from "express";
import FormatController from "./format.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { formatCreateSchema, formatUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(formatCreateSchema, "body"), FormatController.create.bind(FormatController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), FormatController.list.bind(FormatController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), FormatController.getById.bind(FormatController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(formatUpdateSchema, "body"), FormatController.update.bind(FormatController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), FormatController.remove.bind(FormatController));

export default router;
