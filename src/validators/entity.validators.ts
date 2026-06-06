import { z } from "zod";

export const idParamSchema = z.object({ id: z.string().uuid() });

export const paginationSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});

export const userCreateSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  email: z.string(),
  isActive: z.number().optional(),
});

export const userUpdateSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  email: z.string().optional(),
  isActive: z.number().optional(),
});

export const userPasswordCreateSchema = z.object({
  userId: z.string(),
  password: z.string(),
});

export const userPasswordUpdateSchema = z.object({
  userId: z.string().optional(),
  password: z.string().optional(),
});

export const sectionCreateSchema = z.object({
  name: z.string(),
  createdBy: z.string(),
  isDeleted: z.number().optional(),
});

export const sectionUpdateSchema = z.object({
  name: z.string().optional(),
  createdBy: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const sectionRowCreateSchema = z.object({
  sectionId: z.string(),
  rowId: z.string(),
});

export const sectionRowUpdateSchema = z.object({
  sectionId: z.string().optional(),
  rowId: z.string().optional(),
});

export const rowCreateSchema = z.object({
  name: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const rowUpdateSchema = z.object({
  name: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const rowsColumnCreateSchema = z.object({
  rowId: z.string(),
  columnId: z.string(),
});

export const rowsColumnUpdateSchema = z.object({
  rowId: z.string().optional(),
  columnId: z.string().optional(),
});

export const columnCreateSchema = z.object({
  name: z.string().optional(),
  width: z.number().optional(),
  isDeleted: z.number().optional(),
});

export const columnUpdateSchema = z.object({
  name: z.string().optional(),
  width: z.number().optional(),
  isDeleted: z.number().optional(),
});

export const columnInputCreateSchema = z.object({
  columnId: z.string(),
  inputId: z.string(),
});

export const columnInputUpdateSchema = z.object({
  columnId: z.string().optional(),
  inputId: z.string().optional(),
});

export const inputCreateSchema = z.object({
  type: z.string(),
  label: z.string(),
  showLabel: z.number().optional(),
  showQuantity: z.number().optional(),
  isDeleted: z.number().optional(),
});

export const inputUpdateSchema = z.object({
  type: z.string().optional(),
  label: z.string().optional(),
  showLabel: z.number().optional(),
  showQuantity: z.number().optional(),
  isDeleted: z.number().optional(),
});

export const inputTypeCreateSchema = z.object({
  name: z.string(),
});

export const inputTypeUpdateSchema = z.object({
  name: z.string().optional(),
});

export const inputValueCreateSchema = z.object({
  inputEntityTypeId: z.string(),
  quantityId: z.string(),
  formatId: z.string(),
});

export const inputValueUpdateSchema = z.object({
  inputEntityTypeId: z.string().optional(),
  quantityId: z.string().optional(),
  formatId: z.string().optional(),
});

export const inputEntityCreateSchema = z.object({
  name: z.string(),
  type: z.string(),
  isDeleted: z.number().optional(),
});

export const inputEntityUpdateSchema = z.object({
  name: z.string().optional(),
  type: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const inputEntityValueCreateSchema = z.object({
  inputEntityId: z.string(),
  value: z.string(),
});

export const inputEntityValueUpdateSchema = z.object({
  inputEntityId: z.string().optional(),
  value: z.string().optional(),
});

export const dropdownEntityValueCreateSchema = z.object({
  inputEntityId: z.string(),
  optionId: z.string(),
});

export const dropdownEntityValueUpdateSchema = z.object({
  inputEntityId: z.string().optional(),
  optionId: z.string().optional(),
});

export const dropdownOptionCreateSchema = z.object({
  value: z.string(),
});

export const dropdownOptionUpdateSchema = z.object({
  value: z.string().optional(),
});

export const quantityCreateSchema = z.object({
  name: z.string(),
});

export const quantityUpdateSchema = z.object({
  name: z.string().optional(),
});

export const quantityOptionCreateSchema = z.object({
  quantityId: z.string(),
  value: z.string(),
});

export const quantityOptionUpdateSchema = z.object({
  quantityId: z.string().optional(),
  value: z.string().optional(),
});

export const formatCreateSchema = z.object({
  value: z.string(),
});

export const formatUpdateSchema = z.object({
  value: z.string().optional(),
});

export const templateCreateSchema = z.object({
  name: z.string(),
  createdBy: z.string(),
  header: z.string(),
  body: z.string(),
  footer: z.string(),
  isDeleted: z.number().optional(),
});

export const templateUpdateSchema = z.object({
  name: z.string().optional(),
  createdBy: z.string().optional(),
  header: z.string().optional(),
  body: z.string().optional(),
  footer: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const templateSectionCreateSchema = z.object({
  name: z.string(),
  sectionId: z.string(),
  createdBy: z.string(),
  isDeleted: z.number().optional(),
});

export const templateSectionUpdateSchema = z.object({
  name: z.string().optional(),
  sectionId: z.string().optional(),
  createdBy: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const templateSectionRowCreateSchema = z.object({
  sectionId: z.string(),
  rowId: z.string(),
});

export const templateSectionRowUpdateSchema = z.object({
  sectionId: z.string().optional(),
  rowId: z.string().optional(),
});

export const templateRowCreateSchema = z.object({
  name: z.string(),
  isDeleted: z.number().optional(),
});

export const templateRowUpdateSchema = z.object({
  name: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const templateRowsColumnCreateSchema = z.object({
  rowId: z.string(),
  columnId: z.string(),
});

export const templateRowsColumnUpdateSchema = z.object({
  rowId: z.string().optional(),
  columnId: z.string().optional(),
});

export const templateColumnCreateSchema = z.object({
  name: z.string(),
  width: z.number().optional(),
});

export const templateColumnUpdateSchema = z.object({
  name: z.string().optional(),
  width: z.number().optional(),
});

export const templateInputCreateSchema = z.object({
  type: z.string(),
  label: z.string(),
  showLabel: z.number().optional(),
  showQuantity: z.number().optional(),
  value: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const templateInputUpdateSchema = z.object({
  type: z.string().optional(),
  label: z.string().optional(),
  showLabel: z.number().optional(),
  showQuantity: z.number().optional(),
  value: z.string().optional(),
  isDeleted: z.number().optional(),
});

export const templateColumnInputCreateSchema = z.object({
  columnId: z.string(),
  inputId: z.string(),
});

export const templateColumnInputUpdateSchema = z.object({
  columnId: z.string().optional(),
  inputId: z.string().optional(),
});

export const renderedOutputCreateSchema = z.object({
  templateId: z.string(),
});

export const renderedOutputUpdateSchema = z.object({
  templateId: z.string().optional(),
});
