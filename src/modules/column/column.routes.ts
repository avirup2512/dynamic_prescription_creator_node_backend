import express from "express";
import ColumnController from "./column.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { columnCreateSchema, columnUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(columnCreateSchema, "body"), ColumnController.create.bind(ColumnController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), ColumnController.list.bind(ColumnController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), ColumnController.getById.bind(ColumnController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(columnUpdateSchema, "body"), ColumnController.update.bind(ColumnController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), ColumnController.remove.bind(ColumnController));

export default router;
