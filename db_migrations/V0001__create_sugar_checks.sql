CREATE TABLE IF NOT EXISTS sugar_checks (
  id SERIAL PRIMARY KEY,
  date DATE NOT NULL,
  person_id VARCHAR(50) NOT NULL,
  sweet VARCHAR(100) NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(date, person_id, sweet)
);