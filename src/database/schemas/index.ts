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
import { columnInputSchema } from "./columnInput";
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
import { templateColumnInputSchema } from "./templateColumnInput";
import { renderedOutputSchema } from "./renderedOutput";

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
  templateColumnInputSchema,
  renderedOutputSchema
];
