import express from "express";
import DropdownEntityValueController from "./dropdownEntityValue.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { dropdownEntityValueCreateSchema, dropdownEntityValueUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(dropdownEntityValueCreateSchema, "body"), DropdownEntityValueController.create.bind(DropdownEntityValueController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), DropdownEntityValueController.list.bind(DropdownEntityValueController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), DropdownEntityValueController.getById.bind(DropdownEntityValueController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(dropdownEntityValueUpdateSchema, "body"), DropdownEntityValueController.update.bind(DropdownEntityValueController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), DropdownEntityValueController.remove.bind(DropdownEntityValueController));

export default router;
