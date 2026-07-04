import { Request, Response } from "express";
import FoodAndRecipeService from "./foodAndRecipes.service";
import { BaseController } from "../common/base.controller";
export interface ExtendedRequest extends Request {
    user?: Record<string, any>;
}
class FoodAndRecipeController extends BaseController<any> {
    constructor() {
        super(FoodAndRecipeService);
    }

    async searchFoodWithNutrients(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const { foodName } = req.params;
        const result = await service.searchFoodWithNutrients(foodName as string);
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }

    async getFoodCategories(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const result = await service.getFoodCategories();
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }
    async getFoodsByCategory(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const { categoryId } = req.params;
        const result = await service.getFoodsByCategory(categoryId as string);
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }
    async getFoodsAndCategory(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const { categoryId } = req.params;
        const result = await service.getFoodsByCategory(categoryId as string);
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }
    async getAllRecipes(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const { categoryId } = req.params;
        const result = await service.getFoodsByCategory(categoryId as string);
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }
    async getAllRecipeTagCategory(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const result = await service.getAllRecipeTagCategory();
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }
    async getAllRecipeTagByCategoryId(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const { categoryId } = req.params;
        const result = await service.getAllRecipeTagByCategoryId(categoryId as string);
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }
    async findRecipesByTag(req: ExtendedRequest, res: Response) {
        const service = this.service as typeof FoodAndRecipeService;
        const { tagId } = req.params;
        const result = await service.findRecipesByTag(tagId as string);
        if (!result) {
            return res.status(404).json({ success: false, message: "Input entity not found" });
        }
        return res.status(200).json({ success: true, data: result });
    }
    async create(req: Request, res: Response) {
        return super.create(req, res);
    }

    async list(req: Request, res: Response) {
        return super.list(req, res);
    }

    async getById(req: Request, res: Response) {
        return super.getById(req, res);
    }

    async update(req: Request, res: Response) {
        return super.update(req, res);
    }

    async remove(req: Request, res: Response) {
        return super.remove(req, res);
    }
}

export default new FoodAndRecipeController();
