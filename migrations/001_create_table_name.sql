CREATE TABLE apod_data (
  id serial PRIMARY KEY,
  date date UNIQUE NOT NULL,
  data jsonb NOT NULL
);