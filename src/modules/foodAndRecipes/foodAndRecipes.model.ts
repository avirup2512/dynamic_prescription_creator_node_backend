import { BaseModel } from "../common/base.model";
import { query, pool } from "../../database/client";
export class FoodAndRecipeModel extends BaseModel<any> {
    constructor() {
        super(
            "dropdown_options",
            "id",
            ['value'],
            ['value'],
        );
    }
    async searchFoodWithNutrients(name: string) {
        const query = `
        SELECT COALESCE(
        json_agg(
        json_build_object(
            'id', f.id,
            'foodCode', f.food_code,
            'name', f.name,
            'scientificName', f.scientific_name,

            'category', json_build_object(
                'id', fc.id,
                'code', fc.code,
                'name', fc.name
            ),

            'nutrients',
                to_jsonb(fn)
                    - 'id'
                    - 'food_id'
                    - 'created_at'
                    - 'updated_at'
                    - 'is_deleted'
        )
        ORDER BY f.name
        ),
            '[]'::json
        ) AS foods
        FROM foods f
        JOIN food_categories fc
            ON fc.id = f.category_id
        LEFT JOIN food_nutrients fn
            ON fn.food_id = f.id
        WHERE
            f.is_deleted = 0
            AND fc.is_deleted = 0
            AND (fn.is_deleted = 0 OR fn.food_id IS NULL)
            AND (
                f.name ILIKE '%' || $1 || '%'
                OR f.scientific_name ILIKE '%' || $1 || '%'
            );
        `;
        const result = await pool.query(query, [`%${name}%`]);
        return result.rows;
    }
    async getFoodCategories() {
        const query = `
    SELECT
        id,
        code,
        name
    FROM food_categories
    WHERE is_deleted=0
    ORDER BY code;
    `;
        const result = await pool.query(query);
        return result.rows;
    }
    async getFoodsByCategory(categoryId: string) {
        const query = `
    SELECT json_agg(
    json_build_object(
        'id', f.id,
        'foodCode', f.food_code,
        'name', f.name,
        'scientificName', f.scientific_name,
        'category', json_build_object(
            'id', fc.id,
            'code', fc.code,
            'name', fc.name
        ),
        'nutrients', to_jsonb(fn) - 'id'
        - 'food_id'
        - 'created_at'
        - 'updated_at'
        - 'is_deleted'
    )
)
FROM foods f
JOIN food_categories fc
    ON fc.id = f.category_id
JOIN food_nutrients fn
    ON fn.food_id = f.id
WHERE
    f.category_id = $1
    AND f.is_deleted = 0
    AND fc.is_deleted = 0
    AND fn.is_deleted = 0;
    `;
        const result = await pool.query(query, [categoryId]);
        return result.rows;
    }
    async getFoodDetailsById(id: string) {
        const query = `
        SELECT
        f.id,
        f.food_code,
        f.name,
        f.scientific_name,

        fc.id category_id,
        fc.code category_code,
        fc.name category_name,

        COALESCE(
            json_agg(DISTINCT fa.alias)
            FILTER (WHERE fa.alias IS NOT NULL),
            '[]'
        ) aliases,

        row_to_json(fn) nutrients

    FROM foods f

    JOIN food_categories fc
        ON fc.id=f.category_id

    LEFT JOIN food_aliases fa
        ON fa.food_id=f.id

    LEFT JOIN food_nutrients fn
        ON fn.food_id=f.id

    WHERE f.id=$1

    GROUP BY
        f.id,
        fc.id,
        fn.id;
    `;

        return pool.query(query, [id]);
    }
    async getFoodDetailsByName(name: string) {

        const query = `
        SELECT
        f.id,
        f.food_code,
        f.name,
        f.scientific_name,

        fc.code category_code,
        fc.name category_name,

        row_to_json(fn) nutrients

    FROM foods f

    JOIN food_categories fc
        ON fc.id=f.category_id

    LEFT JOIN food_nutrients fn
        ON fn.food_id=f.id

    WHERE
        f.name ILIKE $1
        OR EXISTS (
            SELECT 1
            FROM food_aliases fa
            WHERE
                fa.food_id=f.id
                AND fa.alias ILIKE $1
        );
    `;

        return pool.query(query, [`%${name}%`]);
    }
    async getRecipes(search: string = '') {

        const query = `
        SELECT
            id,
            recipe_code,
            name
        FROM recipes
        WHERE
            is_deleted=0
            AND name ILIKE $1
        ORDER BY name;
        `;

        return pool.query(query, [`%${search}%`]);
    }
    async getRecipeDetails(value: string) {
        const query = `
        SELECT
        r.id,
        r.recipe_code,
        r.name,
        row_to_json(rn) recipe_nutrients,

        (
            SELECT json_agg(ra.alias)
            FROM recipe_aliases ra
            WHERE ra.recipe_id=r.id
        ) aliases,

        (
            SELECT json_agg(rt.tag)
            FROM recipe_tags rt
            WHERE rt.recipe_id=r.id
        ) tags,

        (
            SELECT json_agg(
                json_build_object(
                    'food_id',f.id,
                    'food_code',f.food_code,
                    'food_name',f.name,
                    'quantity',rc.quantity,
                    'unit',rc.unit,
                    'nutrients',row_to_json(fn)
                )
                ORDER BY rc.display_order
            )
            FROM recipe_components rc

            JOIN foods f
                ON f.id=rc.food_id

            LEFT JOIN food_nutrients fn
                ON fn.food_id=f.id

            WHERE rc.recipe_id=r.id
        ) foods

    FROM recipes r

    LEFT JOIN recipe_nutrients rn
        ON rn.recipe_id=r.id

    WHERE
        r.id::text=$1
        OR r.recipe_code=$1
        OR r.name ILIKE $2

    LIMIT 1;
    `;
        return pool.query(query, [value, `%${value}%`]);
    }
    async getMealNutrition(recipeIds: string[]) {

        const query = `
        SELECT
        SUM(rn.energy) energy,
        SUM(rn.protein) protein,
        SUM(rn.fat) fat,
        SUM(rn.carbohydrate) carbohydrate,
        SUM(rn.fiber) fiber

    FROM recipe_nutrients rn

    WHERE rn.recipe_id = ANY($1)
    `;

        return pool.query(query, [recipeIds]);
    }
    async findFoodsByProtein(
        minProtein: number,
        limit = 20
    ) {
        const query = `
        SELECT
            f.id,
            f.food_code,
            f.name,

            fn.protein,
            fn.energy

        FROM foods f

        JOIN food_nutrients fn
            ON fn.food_id=f.id

        WHERE
            fn.protein >= $1

        ORDER BY fn.protein DESC

        LIMIT $2
        `;

        return pool.query(query, [minProtein, limit]);
    }
    async findFoodsByCalories(
        min: number,
        max: number
    ) {
        const query = `
        SELECT
            f.id,
            f.food_code,
            f.name,

            fn.energy

        FROM foods f

        JOIN food_nutrients fn
            ON fn.food_id=f.id

        WHERE
            fn.energy BETWEEN $1 AND $2

        ORDER BY fn.energy
        `;

        return pool.query(query, [min, max]);
    }
    async findRecipesByTag(tag: string) {
        try {
            const query = `
           SELECT
            COALESCE(
            json_agg(
                json_build_object(
                    'id', r.id,
                    'recipeCode', r.recipe_code,
                    'name', r.name,
                    'description', r.description,
                    'category', r.category,
                    'servingSize', r.serving_size,
                    'servingUnit', r.serving_unit,
                    'preparationTime', r.preparation_time,
                    'instructions', r.instructions,

                    'nutrients',
                        to_jsonb(rn)
                            - 'id'
                            - 'recipe_id'
                            - 'created_at'
                            - 'updated_at'
                            - 'is_deleted',

                    'tags',
                    (
                        SELECT COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', rt.id,
                                    'code', rt.code,
                                    'name', rt.name,
                                    'categoryId', rtc.id,
                                    'categoryName', rtc.name
                                )
                                ORDER BY rtc.display_order, rt.display_order
                            ),
                            '[]'::json
                        )
                        FROM recipe_tags_join rtj2
                        JOIN recipe_tags rt
                            ON rt.id = rtj2.tag_id
                        JOIN recipe_tag_categories rtc
                            ON rtc.id = rt.category_id
                        WHERE
                            rtj2.recipe_id = r.id
                            AND rtj2.is_deleted = 0
                            AND rt.is_deleted = 0
                            AND rtc.is_deleted = 0
                    )
                )
                ORDER BY r.name
                ),
                '[]'::json
                ) AS recipes
                FROM recipes r
                JOIN recipe_tags_join rtj
                    ON rtj.recipe_id = r.id
                LEFT JOIN recipe_nutrients rn
                    ON rn.recipe_id = r.id
                WHERE
                    rtj.tag_id = $1
                    AND r.is_deleted = 0
                    AND rtj.is_deleted = 0
                    AND (rn.is_deleted = 0 OR rn.recipe_id IS NULL);
                    `;
            const result = await pool.query(query, [tag]);
            return result.rows;
        } catch (error) {
            throw (error);
        }
    }
    async getFoodByName(name: string) {
        try {

            const selectFood = `SELECT id,name FROM foods WHERE name = $1 OR name LIKE = $2 OR name LIKE=$3 OR name LIKE = $4`;
            const params = [name, name + "%", "%" + name, "%" + name + "%"];
            const foodResult = await pool.query(selectFood, params);
            const foods = foodResult.rows;
            return foods;
        } catch (error) {
            throw error;
        }
    }
    async getRecipeByName(name: string) {
        try {

            const selectedRecipe = `SELECT id,name FROM recipes WHERE name = $1 OR name LIKE = $2 OR name LIKE=$3 OR name LIKE = $4`;
            const params = [name, name + "%", "%" + name, "%" + name + "%"];
            const recipeResult = await pool.query(selectedRecipe, params);
            const recipes = recipeResult.rows;
            return recipes;
        } catch (error) {
            throw error;
        }
    }
    async getAllRecipeTagByTagCategoryId(recipeTagCategoryId: string) {
        try {

            const selectedRecipeTag = `SELECT * FROM recipe_tags WHERE category_id = $1`;
            const params = [recipeTagCategoryId];
            const recipeResult = await pool.query(selectedRecipeTag, params);
            const recipes = recipeResult.rows;
            return recipes;
        } catch (error) {
            throw error;
        }
    }
    async getAllRecipeTagCategory() {
        try {

            const selectedRecipeTag = `SELECT * FROM recipe_tag_categories`;
            const recipeResult = await pool.query(selectedRecipeTag, []);
            const recipes = recipeResult.rows;
            return recipes;
        } catch (error) {
            throw error;
        }
    }
    async findRecipesByTagCategory(tagCategory: string) {
        try {
            const query = `SELECT json_build_object(
    'id', rtc.id,
    'code', rtc.code,
    'name', rtc.name,
    'description', rtc.description,

    'tags',
    (
        SELECT COALESCE(
            json_agg(
                json_build_object(
                    'id', rt.id,
                    'code', rt.code,
                    'name', rt.name,

                    'recipes',
                    (
                        SELECT COALESCE(
                            json_agg(
                                json_build_object(
                                    'id', r.id,
                                    'recipeCode', r.recipe_code,
                                    'name', r.name,
                                    'description', r.description,
                                    'category', r.category,
                                    'servingSize', r.serving_size,
                                    'servingUnit', r.serving_unit,
                                    'preparationTime', r.preparation_time,
                                    'instructions', r.instructions,
                                    'type_name', 'INPUT_TYPE_4',
                                    'nutrients',
                                    (
                                        SELECT
                                            to_jsonb(rn)
                                                - 'id'
                                                - 'recipe_id'
                                                - 'created_at'
                                                - 'updated_at'
                                                - 'is_deleted'
                                        FROM recipe_nutrients rn
                                        WHERE
                                            rn.recipe_id = r.id
                                            AND rn.is_deleted = 0
                                    ),

                                    'ingredients',
                                    (
                                        SELECT COALESCE(
                                            json_agg(
                                                json_build_object(
                                                    'id', rc.id,
                                                    'type', rc.component_type,

                                                    'foodId', rc.food_id,
                                                    'recipeId', rc.child_recipe_id,

                                                    'name',
                                                    CASE
                                                        WHEN rc.component_type = 'food'
                                                            THEN f.name
                                                        ELSE cr.name
                                                    END,

                                                    'quantity', rc.quantity,
                                                    'unit', rc.unit,
                                                    'displayOrder', rc.display_order,
                                                    'optional', rc.is_optional,
                                                    'remarks', rc.remarks
                                                )
                                                ORDER BY rc.display_order
                                            ),
                                            '[]'::json
                                        )
                                        FROM recipe_components rc
                                        LEFT JOIN foods f
                                            ON f.id = rc.food_id
                                        LEFT JOIN recipes cr
                                            ON cr.id = rc.child_recipe_id
                                        WHERE
                                            rc.recipe_id = r.id
                                            AND rc.is_deleted = 0
                                    )
                                )
                                ORDER BY r.name
                            ),
                            '[]'::json
                        )
                        FROM recipe_tags_join rtj
                        JOIN recipes r
                            ON r.id = rtj.recipe_id
                        WHERE
                            rtj.tag_id = rt.id
                            AND rtj.is_deleted = 0
                            AND r.is_deleted = 0
                    )
                )
                ORDER BY rt.display_order, rt.name
            ),
            '[]'::json
        )
        FROM recipe_tags rt
        WHERE
            rt.category_id = rtc.id
            AND rt.is_deleted = 0
    )
) AS result
FROM recipe_tag_categories rtc
WHERE
    rtc.id = $1
    AND rtc.is_deleted = 0;`;
            const result = await pool.query(query, [tagCategory]);
            return result.rows;
        } catch (error) {
            throw (error);
        }
    }
}
