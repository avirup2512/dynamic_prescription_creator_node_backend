import { PoolClient } from 'pg';

export type UUID = string;

export interface InputInput {
    id: UUID;
    type?: string;
    name?: string;
    input_entity_id?: UUID | null;
    show_label?: boolean;
    quantity_id?: UUID | null;
    show_quantity?: boolean;
    input_order?: number;
    is_bold?: boolean | number;
    font_size?: number;
    extra_note?: number | boolean;
    is_deleted?: number;
}

export interface InputGroupInput {
    id: UUID;
    input_group_order?: number;
    inputs?: InputInput[];
}

export interface ColumnInput {
    id: UUID;
    name?: string;
    width?: number;
    column_order?: number;
    inputGroup?: InputGroupInput[];
}

export interface RowInput {
    id: UUID;
    name?: string;
    row_order?: number;
    columns?: ColumnInput[];
    column?: ColumnInput[]; // legacy alias some callers still send
}

export interface SectionInput {
    id: UUID;
    name?: string;
    is_deleted?: number;
    rows?: RowInput[];
}

export interface UpsertContext {
    client: PoolClient;
    userId: UUID;
    inputTypeUuidCache: Map<string, UUID>;
}