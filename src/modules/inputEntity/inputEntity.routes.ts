import express from "express";
import InputEntityController from "./inputEntity.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../validators/validateRequest";
import { inputEntityCreateSchema, inputEntityUpdateSchema, idParamSchema, paginationSchema } from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest(inputEntityCreateSchema, "body"), InputEntityController.create.bind(InputEntityController));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), InputEntityController.getAllInput.bind(InputEntityController));
// router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputEntityController.getById.bind(InputEntityController));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputEntityController.getByAllInputInformationById.bind(InputEntityController));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(inputEntityUpdateSchema, "body"), InputEntityController.updateInputEntity.bind(InputEntityController));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputEntityController.deleteInputEntity.bind(InputEntityController));

router.get("/dropdown/:id", authMiddleware, validateRequest(idParamSchema, "params"), InputEntityController.getByAllDropdownInputInformationById.bind(InputEntityController));

router.put("/dropdown/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(inputEntityUpdateSchema, "body"), InputEntityController.updateDropdownEntity.bind(InputEntityController));
router.put("/dropdown/addsingleOption/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest(inputEntityUpdateSchema, "body"), InputEntityController.AddSingleDropdownEntity.bind(InputEntityController));
router.post("/suggestdropdown", authMiddleware, validateRequest(inputEntityCreateSchema, "body"), InputEntityController.getDropdownContentFromAI.bind(InputEntityController));

export default router;
