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
}

async function seedInputTypes() {
  const values = ["INPUT_TYPE_1", "INPUT_TYPE_2", "INPUT_TYPE_3", "INPUT_TYPE_4", "INPUT_TYPE_5", "INPUT_TYPE_6", "INPUT_TYPE_7"];

  for (const name of values) {
    await query(
      `INSERT INTO input_types (name) VALUES ($1)
       ON CONFLICT (name) DO NOTHING`,
      [name],
    );
  }

  console.log("✅ Seeded input_types values");
}
