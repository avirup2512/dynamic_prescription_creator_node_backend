import express from "express";
import DropdownOptionController from "./dropdownOption.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { dropdownOptionCreateSchema, dropdownOptionUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(dropdownOptionCreateSchema, "body"), DropdownOptionController.create.bind(DropdownOptionController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), DropdownOptionController.list.bind(DropdownOptionController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), DropdownOptionController.getById.bind(DropdownOptionController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(dropdownOptionUpdateSchema, "body"), DropdownOptionController.update.bind(DropdownOptionController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), DropdownOptionController.remove.bind(DropdownOptionController));

export default router;
