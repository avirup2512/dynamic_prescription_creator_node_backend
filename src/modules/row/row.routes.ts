import express from "express";
import RowController from "./row.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { rowCreateSchema, rowUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(rowCreateSchema, "body"), RowController.create.bind(RowController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), RowController.list.bind(RowController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), RowController.getById.bind(RowController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(rowUpdateSchema, "body"), RowController.update.bind(RowController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), RowController.remove.bind(RowController));

export default router;
