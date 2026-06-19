export const userPasswordSchema = {
  name: 'user_passwords',
  createStatement: `CREATE TABLE IF NOT EXISTS user_passwords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT fk_user_password_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);`
};