from pathlib import Path

root = Path(r"c:\Users\aviru\OneDrive\Documents\My Prescription\Server")
entity_definitions = [
    {
        "name": "user",
        "class": "User",
        "table": "users",
        "insert_columns": ["firstname", "lastname", "email", "is_active"],
        "search_columns": ["firstname", "lastname", "email"],
        "fields": [
            ("firstname", "string", True),
            ("lastname", "string", True),
            ("email", "string", True),
            ("isActive", "number", False),
        ],
    },
    {
        "name": "userPassword",
        "class": "UserPassword",
        "table": "user_passwords",
        "insert_columns": ["user_id", "password"],
        "search_columns": ["password"],
        "fields": [
            ("userId", "string", True),
            ("password", "string", True),
        ],
    },
    {
        "name": "section",
        "class": "Section",
        "table": "sections",
        "insert_columns": ["name", "created_by", "is_deleted"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
            ("createdBy", "string", True),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "sectionRow",
        "class": "SectionRow",
        "table": "section_rows",
        "insert_columns": ["section_id", "row_id"],
        "search_columns": [],
        "fields": [
            ("sectionId", "string", True),
            ("rowId", "string", True),
        ],
    },
    {
        "name": "row",
        "class": "Row",
        "table": "rows",
        "insert_columns": ["name", "is_deleted"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", False),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "rowsColumn",
        "class": "RowsColumn",
        "table": "rows_columns",
        "insert_columns": ["row_id", "column_id"],
        "search_columns": [],
        "fields": [
            ("rowId", "string", True),
            ("columnId", "string", True),
        ],
    },
    {
        "name": "column",
        "class": "Column",
        "table": "columns",
        "insert_columns": ["name", "width", "is_deleted"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", False),
            ("width", "number", False),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "columnInput",
        "class": "ColumnInput",
        "table": "column_inputs",
        "insert_columns": ["column_id", "input_id"],
        "search_columns": [],
        "fields": [
            ("columnId", "string", True),
            ("inputId", "string", True),
        ],
    },
    {
        "name": "input",
        "class": "Input",
        "table": "inputs",
        "insert_columns": ["type_id", "label", "show_label", "show_quantity", "is_deleted"],
        "search_columns": ["label"],
        "fields": [
            ("type", "string", True),
            ("label", "string", True),
            ("showLabel", "number", False),
            ("showQuantity", "number", False),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "inputType",
        "class": "InputType",
        "table": "input_types",
        "insert_columns": ["name"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
        ],
    },
    {
        "name": "inputValue",
        "class": "InputValue",
        "table": "input_values",
        "insert_columns": ["input_entity_type_id", "quantity_id", "format_id"],
        "search_columns": [],
        "fields": [
            ("inputEntityTypeId", "string", True),
            ("quantityId", "string", True),
            ("formatId", "string", True),
        ],
    },
    {
        "name": "inputEntity",
        "class": "InputEntity",
        "table": "input_entities",
        "insert_columns": ["name", "type_id", "is_deleted"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
            ("type", "string", True),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "inputEntityValue",
        "class": "InputEntityValue",
        "table": "input_entity_values",
        "insert_columns": ["input_entity_id", "value"],
        "search_columns": ["value"],
        "fields": [
            ("inputEntityId", "string", True),
            ("value", "string", True),
        ],
    },
    {
        "name": "dropdownEntityValue",
        "class": "DropdownEntityValue",
        "table": "dropdown_entity_values",
        "insert_columns": ["input_entity_id", "option_id"],
        "search_columns": [],
        "fields": [
            ("inputEntityId", "string", True),
            ("optionId", "string", True),
        ],
    },
    {
        "name": "dropdownOption",
        "class": "DropdownOption",
        "table": "dropdown_options",
        "insert_columns": ["value"],
        "search_columns": ["value"],
        "fields": [
            ("value", "string", True),
        ],
    },
    {
        "name": "quantity",
        "class": "Quantity",
        "table": "quantities",
        "insert_columns": ["name"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
        ],
    },
    {
        "name": "quantityOption",
        "class": "QuantityOption",
        "table": "quantity_options",
        "insert_columns": ["quantity_id", "value"],
        "search_columns": ["value"],
        "fields": [
            ("quantityId", "string", True),
            ("value", "string", True),
        ],
    },
    {
        "name": "format",
        "class": "Format",
        "table": "formats",
        "insert_columns": ["value"],
        "search_columns": ["value"],
        "fields": [
            ("value", "string", True),
        ],
    },
    {
        "name": "template",
        "class": "Template",
        "table": "templates",
        "insert_columns": ["name", "created_by", "header", "body", "footer", "is_deleted"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
            ("createdBy", "string", True),
            ("header", "string", True),
            ("body", "string", True),
            ("footer", "string", True),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "templateSection",
        "class": "TemplateSection",
        "table": "template_sections",
        "insert_columns": ["name", "section_id", "created_by", "is_deleted"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
            ("sectionId", "string", True),
            ("createdBy", "string", True),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "templateSectionRow",
        "class": "TemplateSectionRow",
        "table": "template_section_rows",
        "insert_columns": ["section_id", "row_id"],
        "search_columns": [],
        "fields": [
            ("sectionId", "string", True),
            ("rowId", "string", True),
        ],
    },
    {
        "name": "templateRow",
        "class": "TemplateRow",
        "table": "template_rows",
        "insert_columns": ["name", "is_deleted"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "templateRowsColumn",
        "class": "TemplateRowsColumn",
        "table": "template_rows_columns",
        "insert_columns": ["row_id", "column_id"],
        "search_columns": [],
        "fields": [
            ("rowId", "string", True),
            ("columnId", "string", True),
        ],
    },
    {
        "name": "templateColumn",
        "class": "TemplateColumn",
        "table": "template_columns",
        "insert_columns": ["name", "width"],
        "search_columns": ["name"],
        "fields": [
            ("name", "string", True),
            ("width", "number", False),
        ],
    },
    {
        "name": "templateInput",
        "class": "TemplateInput",
        "table": "template_inputs",
        "insert_columns": ["type_id", "label", "show_label", "show_quantity", "value", "is_deleted"],
        "search_columns": ["label", "value"],
        "fields": [
            ("type", "string", True),
            ("label", "string", True),
            ("showLabel", "number", False),
            ("showQuantity", "number", False),
            ("value", "string", False),
            ("isDeleted", "number", False),
        ],
    },
    {
        "name": "templateColumnInput",
        "class": "TemplateColumnInput",
        "table": "template_column_inputs",
        "insert_columns": ["column_id", "input_id"],
        "search_columns": [],
        "fields": [
            ("columnId", "string", True),
            ("inputId", "string", True),
        ],
    },
    {
        "name": "renderedOutput",
        "class": "RenderedOutput",
        "table": "rendered_outputs",
        "insert_columns": ["template_id"],
        "search_columns": [],
        "fields": [
            ("templateId", "string", True),
        ],
    },
]

def make_schema_name(name: str) -> str:
    return name


def field_zod_type(field_type: str) -> str:
    if field_type == "string":
        return "z.string()"
    if field_type == "number":
        return "z.number()"
    return "z.string()"


def write_file(path: Path, content: str):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


validator_lines = [
    'import { z } from "zod";\n',
    'export const idParamSchema = z.object({ id: z.string().uuid() });\n',
    'export const paginationSchema = z.object({\n  page: z.string().optional(),\n  limit: z.string().optional(),\n  search: z.string().optional(),\n});\n',
]

for entity in entity_definitions:
    folder = root / "src" / "modules" / entity["name"]
    folder.mkdir(parents=True, exist_ok=True)

    model_content = f'''import {{ BaseModel }} from "../common/base.model";
import {{ {entity['class']} }} from "../../types/entities";

export class {entity['class']}Model extends BaseModel<{entity['class']}> {{
  constructor() {{
    super(
      "{entity['table']}",
      "id",
      {entity['insert_columns']},
      {entity['search_columns']},
    );
  }}
}}
'''

    service_content = f'''import {{ BaseService }} from "../common/base.service";
import {{ {entity['class']}Model }} from "./{entity['name']}.model";
import {{ {entity['class']} }} from "../../types/entities";

export class {entity['class']}Service extends BaseService<{entity['class']}> {{
  constructor() {{
    super(new {entity['class']}Model());
  }}
}}

export default new {entity['class']}Service();
'''

    controller_content = f'''import {{ Request, Response }} from "express";
import {entity['class']}Service from "./{entity['name']}.service";
import {{ BaseController }} from "../common/base.controller";

class {entity['class']}Controller extends BaseController<{entity['class']}> {{
  constructor() {{
    super({entity['class']}Service);
  }}

  async create(req: Request, res: Response) {{
    return super.create(req, res);
  }}

  async list(req: Request, res: Response) {{
    return super.list(req, res);
  }}

  async getById(req: Request, res: Response) {{
    return super.getById(req, res);
  }}

  async update(req: Request, res: Response) {{
    return super.update(req, res);
  }}

  async remove(req: Request, res: Response) {{
    return super.remove(req, res);
  }}
}}

export default new {entity['class']}Controller();
'''

    route_content = f'''import express from "express";
import {entity['class']}Controller from "./{entity['name']}.controller";
import {{ authMiddleware }} from "../../middlewares/auth.middleware";
import {{ validateRequest }} from "../../validators/validateRequest";
import {{ {entity['name']}CreateSchema, {entity['name']}UpdateSchema, idParamSchema, paginationSchema }} from "../../validators/entity.validators";

const router = express.Router();

router.post("/", authMiddleware, validateRequest({entity['name']}CreateSchema, "body"), {entity['class']}Controller.create.bind({entity['class']}Controller));
router.get("/", authMiddleware, validateRequest(paginationSchema, "query"), {entity['class']}Controller.list.bind({entity['class']}Controller));
router.get("/:id", authMiddleware, validateRequest(idParamSchema, "params"), {entity['class']}Controller.getById.bind({entity['class']}Controller));
router.put("/:id", authMiddleware, validateRequest(idParamSchema, "params"), validateRequest({entity['name']}UpdateSchema, "body"), {entity['class']}Controller.update.bind({entity['class']}Controller));
router.delete("/:id", authMiddleware, validateRequest(idParamSchema, "params"), {entity['class']}Controller.remove.bind({entity['class']}Controller));

export default router;
'''

    write_file(folder / f"{entity['name']}.model.ts", model_content)
    write_file(folder / f"{entity['name']}.service.ts", service_content)
    write_file(folder / f"{entity['name']}.controller.ts", controller_content)
    write_file(folder / f"{entity['name']}.routes.ts", route_content)

    create_fields = []
    update_fields = []
    for key, field_type, required in entity["fields"]:
        ztype = field_zod_type(field_type)
        if required:
            create_fields.append(f"  {key}: {ztype},")
        else:
            create_fields.append(f"  {key}: {ztype}.optional(),")
        update_fields.append(f"  {key}: {ztype}.optional(),")

    validator_lines.append(f'export const {entity["name"]}CreateSchema = z.object({{\n' + "\n".join(create_fields) + '\n});\n')
    validator_lines.append(f'export const {entity["name"]}UpdateSchema = z.object({{\n' + "\n".join(update_fields) + '\n});\n')

write_file(root / "src" / "validators" / "entity.validators.ts", "\n".join(validator_lines))

schema_index_lines = [
    'import { userSchema } from "./user";\n',
    'import { userPasswordSchema } from "./userPassword";\n',
    'import { inputTypeSchema } from "./inputType";\n',
    'import { formatSchema } from "./format";\n',
    'import { quantitySchema } from "./quantity";\n',
    'import { dropdownOptionSchema } from "./dropdownOption";\n',
    'import { sectionSchema } from "./section";\n',
    'import { rowSchema } from "./row";\n',
    'import { columnSchema } from "./column";\n',
    'import { inputSchema } from "./input";\n',
    'import { inputEntitySchema } from "./inputEntity";\n',
    'import { inputValueSchema } from "./inputValue";\n',
    'import { inputEntityValueSchema } from "./inputEntityValue";\n',
    'import { dropdownEntityValueSchema } from "./dropdownEntityValue";\n',
    'import { quantityOptionSchema } from "./quantityOption";\n',
    'import { sectionRowSchema } from "./sectionRow";\n',
    'import { rowsColumnSchema } from "./rowsColumn";\n',
    'import { columnInputSchema } from "./columnInput";\n',
    'import { templateSchema } from "./template";\n',
    'import { templateSectionSchema } from "./templateSection";\n',
    'import { templateRowSchema } from "./templateRow";\n',
    'import { templateColumnSchema } from "./templateColumn";\n',
    'import { templateInputSchema } from "./templateInput";\n',
    'import { templateSectionRowSchema } from "./templateSectionRow";\n',
    'import { templateRowsColumnSchema } from "./templateRowsColumn";\n',
    'import { templateColumnInputSchema } from "./templateColumnInput";\n',
    'import { renderedOutputSchema } from "./renderedOutput";\n',
]

schema_index_lines.append('\nexport const schemas = [\n')
for entity in entity_definitions:
    schema_index_lines.append(f'  {entity["name"]}Schema,\n')
schema_index_lines.append('];\n')

write_file(root / "src" / "database" / "schemas" / "index.ts", "".join(schema_index_lines))
print("Generated entity modules, validator file, and schema index.")
