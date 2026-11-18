-- Datado schema (Neon / PostgreSQL)
CREATE TABLE IF NOT EXISTS photos (
  id          SERIAL PRIMARY KEY,
  archive     TEXT NOT NULL,
  source_url  TEXT,
  year        INTEGER NOT NULL,
  city        TEXT NOT NULL,
  state       TEXT NOT NULL,
  lat         FLOAT NOT NULL,
  lon         FLOAT NOT NULL,
  title       TEXT NOT NULL,
  caption     TEXT NOT NULL,
  image_url   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS editions (
  id             SERIAL PRIMARY KEY,
  edition_number INTEGER NOT NULL UNIQUE,
  edition_date   DATE NOT NULL UNIQUE,
  photo1_id      INTEGER REFERENCES photos(id),
  photo2_id      INTEGER REFERENCES photos(id),
  photo3_id      INTEGER REFERENCES photos(id),
  photo4_id      INTEGER REFERENCES photos(id),
  photo5_id      INTEGER REFERENCES photos(id)
);
