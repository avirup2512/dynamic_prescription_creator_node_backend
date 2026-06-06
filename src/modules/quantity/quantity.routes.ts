import express from "express";
import QuantityController from "./quantity.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { quantityCreateSchema, quantityUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(quantityCreateSchema, "body"), QuantityController.create.bind(QuantityController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), QuantityController.getAllInput.bind(QuantityController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), QuantityController.getQuantityInputInformationById.bind(QuantityController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(quantityUpdateSchema, "body"), QuantityController.updateQuantityEntity.bind(QuantityController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), QuantityController.deleteQuantity.bind(QuantityController));

export default router;
