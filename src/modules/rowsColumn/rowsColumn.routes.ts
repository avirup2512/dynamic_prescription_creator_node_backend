import express from "express";
import RowsColumnController from "./rowsColumn.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { rowsColumnCreateSchema, rowsColumnUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(rowsColumnCreateSchema, "body"), RowsColumnController.create.bind(RowsColumnController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), RowsColumnController.list.bind(RowsColumnController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), RowsColumnController.getById.bind(RowsColumnController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(rowsColumnUpdateSchema, "body"), RowsColumnController.update.bind(RowsColumnController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), RowsColumnController.remove.bind(RowsColumnController));

export default router;
