import express from "express";
import FoodAndRecipesController from "./foodAndRecipes.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = express.Router();

// router.post("/", authMiddleware, FoodAndRecipesController.create.bind(FoodAndRecipesController));
router.get("/getFoodCategory", authMiddleware, FoodAndRecipesController.getFoodCategories.bind(FoodAndRecipesController));
router.get("/getFoodByCategory/:categoryId", authMiddleware, FoodAndRecipesController.getFoodsByCategory.bind(FoodAndRecipesController));
router.get("/getrecipeTagCategory", authMiddleware, FoodAndRecipesController.getAllRecipeTagCategory.bind(FoodAndRecipesController));
router.get("/getTagByCategory/:categoryId", authMiddleware, FoodAndRecipesController.getAllRecipeTagByCategoryId.bind(FoodAndRecipesController));
router.get("/getRecipeByTag/:tagId", authMiddleware, FoodAndRecipesController.findRecipesByTag.bind(FoodAndRecipesController));
router.get("/searchFood/:foodName", authMiddleware, FoodAndRecipesController.searchFoodWithNutrients.bind(FoodAndRecipesController));

// router.put("/:id", authMiddleware, validateRequest(dropdownOptionUpdateSchema, "body"), DropdownOptionController.update.bind(DropdownOptionController));
// router.delete("/:id", authMiddleware, FoodAndRecipesController.remove.bind(DropdownOptionController));

export default router;
