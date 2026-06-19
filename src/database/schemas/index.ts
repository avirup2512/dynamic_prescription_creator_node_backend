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
  templateInputGroupOrSchema
];
