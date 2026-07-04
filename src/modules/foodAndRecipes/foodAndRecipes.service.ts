import { BaseService } from "../common/base.service";
import { FoodAndRecipeModel } from "./foodAndRecipes.model";

export class FoodAndRecipeService extends BaseService<any> {
    constructor() {
        super(new FoodAndRecipeModel());
    }
    async searchFoodWithNutrients(name: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.searchFoodWithNutrients(name);
        return result;
    }
    async getFoodCategories() {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.getFoodCategories();
        return result;
    }
    async getFoodsByCategory(categoryId: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.getFoodsByCategory(categoryId);
        return result;
    }
    async getFoodDetailsById(foodId: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.getFoodDetailsById(foodId);
        return result;
    }
    async getFoodDetailsByName(name: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.getFoodDetailsByName(name);
        return result;
    }
    async getRecipes(name: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.getRecipes(name);
        return result;
    }
    async getRecipeDetails(name: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.getRecipeDetails(name);
        return result;
    }
    async getFoodAndRecipeByName(name: string) {
        const model = this.model as FoodAndRecipeModel;
        // const foods = await model.getFoodByName(name);
        // const recipes = await model.getRecipeByName(name);
        const result = await Promise.all([model.getFoodByName(name), model.getRecipeByName(name)]);
        return result;
    }
    async getAllRecipeTagByCategoryId(recipeTagCategoryId: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.findRecipesByTagCategory(recipeTagCategoryId);
        return result;
    }
    async getAllRecipeTagCategory() {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.getAllRecipeTagCategory();
        return result;
    }
    async findRecipesByTag(tagId: string) {
        const model = this.model as FoodAndRecipeModel;
        const result = await model.findRecipesByTag(tagId);
        return result;
    }
}

export default new FoodAndRecipeService();
