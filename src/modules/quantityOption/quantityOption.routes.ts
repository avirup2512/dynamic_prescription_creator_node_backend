import express from "express";
import QuantityOptionController from "./quantityOption.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { quantityOptionCreateSchema, quantityOptionUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(quantityOptionCreateSchema, "body"), QuantityOptionController.create.bind(QuantityOptionController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), QuantityOptionController.list.bind(QuantityOptionController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), QuantityOptionController.getById.bind(QuantityOptionController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(quantityOptionUpdateSchema, "body"), QuantityOptionController.update.bind(QuantityOptionController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), QuantityOptionController.remove.bind(QuantityOptionController));

export default router;
