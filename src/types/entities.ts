export interface User {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  isActive: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserPassword {
  id: string;
  userId: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Section {
  id: string;
  name: string;
  createdBy: string;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface SectionRow {
  id: string;
  sectionId: string;
  rowId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Row {
  id: string;
  name: string;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RowsColumn {
  id: string;
  rowId: string;
  columnId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Column {
  id: string;
  name: string;
  width: number;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColumnInput {
  id: string;
  columnId: string;
  inputId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Input {
  id: string;
  type: string;
  label: string;
  showLabel: number;
  showQuantity: number;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InputType {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InputValue {
  id: string;
  inputEntityTypeId: string;
  quantityId: string;
  formatId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InputEntity {
  id: string;
  name: string;
  type: string;
  type_id: string;
  user_id: string | null;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InputEntityValue {
  id: string;
  inputEntityId: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DropdownEntityValue {
  id: string;
  inputEntityId: string;
  optionId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DropdownOption {
  id: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quantity {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuantityOption {
  id: string;
  quantityId: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Format {
  id: string;
  value: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  createdBy: string;
  header: string;
  body: string;
  footer: string;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateSection {
  id: string;
  name: string;
  sectionId: string;
  createdBy: string;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateSectionRow {
  id: string;
  sectionId: string;
  rowId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateRow {
  id: string;
  name: string;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateRowsColumn {
  id: string;
  rowId: string;
  columnId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateColumn {
  id: string;
  name: string;
  width: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateColumnInput {
  id: string;
  columnId: string;
  inputId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateInput {
  id: string;
  type: string;
  label: string;
  showLabel: number;
  showQuantity: number;
  value: string;
  isDeleted: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RenderedOutput {
  id: string;
  templateId: string;
  createdAt?: string;
  updatedAt?: string;
}
