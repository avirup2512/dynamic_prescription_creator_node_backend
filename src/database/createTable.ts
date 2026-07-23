import { query } from "./client";
import { schemas } from "./schemas";

export async function createTables() {
  try {
    await query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  } catch (error) {
    console.warn("Could not create uuid-ossp extension; it may already exist or require elevated privileges.", error);
  }

  for (const schema of schemas) {
    try {
      console.log(`Creating table ${schema.name}...`);
      await query(schema.createStatement);
      console.log(`✅ Table ${schema.name} is ready`);
    } catch (error) {
      console.error(`Failed to create table ${schema.name}`, error);
      throw error;
    }
  }

  await seedInputTypes();
  await seedInputConditions();
}

async function seedInputTypes() {
  const values = ["INPUT_TYPE_1", "INPUT_TYPE_2", "INPUT_TYPE_3", "INPUT_TYPE_4", "INPUT_TYPE_5", "INPUT_TYPE_6", "INPUT_TYPE_7", "INPUT_TYPE_8", "INPUT_TYPE_9", "INPUT_TYPE_10", "INPUT_TYPE_11", "INPUT_TYPE_12", "INPUT_TYPE_13", "INPUT_TYPE_14", "INPUT_TYPE_15", "INPUT_TYPE_16", "INPUT_TYPE_17", "INPUT_TYPE_18", "INPUT_TYPE_19", "INPUT_TYPE_20"];

  for (const name of values) {
    await query(
      `INSERT INTO input_types (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name],
    );
  }

  console.log("✅ Seeded input_types values");
}
async function seedInputConditions() {
  const values = ["OR", "AND", "FROM_TO", "TO", "PLUS", "WITH", "BEFORE", "AFTER", "FOLLOWED_BY", "REPLACE_WITH", "IF", "AVOID"];

  for (const name of values) {
    await query(
      `INSERT INTO input_conditions (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name],
    );
  }

  console.log("✅ Seeded input_conditions values");
}
