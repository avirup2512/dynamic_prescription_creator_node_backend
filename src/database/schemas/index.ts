import { userSchema } from "./user";
import { userPasswordSchema } from "./userPassword";
import { inputTypeSchema } from "./inputType";
import { formatSchema } from "./format";
import { quantitySchema } from "./quantity";
import { dropdownOptionSchema } from "./dropdownOption";
import { sectionSchema } from "./section";
import { rowSchema } from "./row";
import { columnSchema } from "./column";
import { inputSchema } from "./input";
import { inputEntitySchema } from "./inputEntity";
import { inputValueSchema } from "./inputValue";
import { inputEntityValueSchema } from "./inputEntityValue";
import { dropdownEntityValueSchema } from "./dropdownEntityValue";
import { quantityOptionSchema } from "./quantityOption";
import { sectionRowSchema } from "./sectionRow";
import { rowsColumnSchema } from "./rowsColumn";
import { columnInputSchema } from "./columnInputGroupJoin";
import { templateSchema } from "./template";
import { templateSectionSchema } from "./templateSection";
import { templateRowSchema } from "./templateRow";
import { templateColumnSchema } from "./templateColumn";
import { templateInputSchema } from "./templateInput";
import { templateInputExtranoteSchema } from "./templateInputExtranote";
import { templateInputQuantityOptionSchema } from "./templateInputQuantityOption";
import { templateInputValueSchema } from "./templateInputValue";
import { templateInputsQuantityValueSchema } from "./templateInputsQuantityValue";
import { templateSectionRowSchema } from "./templateSectionRow";
import { templateRowsColumnSchema } from "./templateRowsColumn";
import { renderedOutputSchema } from "./renderedOutput";
import { templateInputOrSchema } from "./templateInputOr";
import { templateInputAndSchema } from "./templateInputAnd";
import { globalDropdownEntityOptionsSchema } from "./globalDropdownEntityOptions";
import { globalDropdownEntities } from "./globalDropdownEntities";
import { globalDropdownOptionSchema } from "./globalDropdownOptions";
import { templateInputDropdownOptionsSchema } from "./templateInputDropdownOptions";
import { templateInputGroupSchema } from "./templateInputGroup";
import { templateInputGroupJoinSchema } from "./templateInputGroupJoin";
import { sectionInputGroupSchema } from "./sectionInputGroup";
import { sectionInputGroupJoinSchema } from "./sectionInputGroupJoin";
import { templateColumnInputGroupJoinSchema } from "./templateColumnInputGroupJoin";
import { templateInputGroupOrSchema } from "./templateInputGroupOr";
import { foodCategorySchema } from "./food schemas/foodCategorySchema";
import { foodSchema } from "./food schemas/foodSchema";
import { foodAliasSchema } from "./food schemas/foodAliasSchema";
import { foodNutrientSchema } from "./food schemas/foodNutrientSchema";
import { recipeSchema } from "./recipe schemas/recipesSchemas";
import { recipeComponentSchema } from "./recipe schemas/recipeComponentSchema";
import { recipeAliasSchema } from "./recipe schemas/recipeAliasSchema";
import { recipeNutrientSchema } from "./recipe schemas/recipeNutrientSchema";
import { recipeTagSchema } from "./recipe schemas/recipeTagSchema";
import { recipeTagJoinSchema } from "./recipe schemas/recipeTagMappings";
import { recipeTagCategorySchema } from "./recipe schemas/recipeTagsCategory";
import { templateFoodJoinSchema } from "./templateFoodJoin";
import { templateRecipeJoinSchema } from "./templateRecipeJoin";
export const schemas = [
  userSchema,
  userPasswordSchema,
  inputTypeSchema,
  formatSchema,
  quantitySchema,
  dropdownOptionSchema,
  sectionSchema,
  rowSchema,
  columnSchema,
  inputSchema,
  inputEntitySchema,
  inputValueSchema,
  inputEntityValueSchema,
  dropdownEntityValueSchema,
  quantityOptionSchema,
  sectionRowSchema,
  rowsColumnSchema,
  columnInputSchema,
  templateSchema,
  templateSectionSchema,
  templateRowSchema,
  templateColumnSchema,
  templateInputSchema,
  templateInputExtranoteSchema,
  templateInputQuantityOptionSchema,
  templateInputValueSchema,
  templateInputsQuantityValueSchema,
  templateSectionRowSchema,
  templateRowsColumnSchema,
  renderedOutputSchema,
  templateInputOrSchema,
  templateInputAndSchema,
  globalDropdownEntities,
  globalDropdownOptionSchema,
  globalDropdownEntityOptionsSchema,
  templateInputDropdownOptionsSchema,
  templateInputGroupSchema,
  templateInputGroupJoinSchema,
  templateColumnInputGroupJoinSchema,
  sectionInputGroupSchema,
  sectionInputGroupJoinSchema,
  templateInputGroupOrSchema,
  foodCategorySchema,
  foodSchema,
  foodAliasSchema,
  foodNutrientSchema,
  recipeSchema,
  recipeComponentSchema,
  recipeAliasSchema,
  recipeNutrientSchema,
  recipeTagCategorySchema,
  recipeTagSchema,
  recipeTagJoinSchema,
  templateRecipeJoinSchema,
  templateFoodJoinSchema
];
