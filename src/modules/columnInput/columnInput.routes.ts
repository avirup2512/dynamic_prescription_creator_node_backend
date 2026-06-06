import express from "express";
import ColumnInputController from "./columnInput.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { columnInputCreateSchema, columnInputUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(columnInputCreateSchema, "body"), ColumnInputController.create.bind(ColumnInputController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), ColumnInputController.list.bind(ColumnInputController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), ColumnInputController.getById.bind(ColumnInputController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(columnInputUpdateSchema, "body"), ColumnInputController.update.bind(ColumnInputController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), ColumnInputController.remove.bind(ColumnInputController));

export default router;
