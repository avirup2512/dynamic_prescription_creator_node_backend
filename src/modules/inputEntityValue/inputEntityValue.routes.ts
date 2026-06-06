import express from "express";
import InputEntityValueController from "./inputEntityValue.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { inputEntityValueCreateSchema, inputEntityValueUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(inputEntityValueCreateSchema, "body"), InputEntityValueController.create.bind(InputEntityValueController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), InputEntityValueController.list.bind(InputEntityValueController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputEntityValueController.getById.bind(InputEntityValueController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(inputEntityValueUpdateSchema, "body"), InputEntityValueController.update.bind(InputEntityValueController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputEntityValueController.remove.bind(InputEntityValueController));

export default router;
