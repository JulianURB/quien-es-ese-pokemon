-- Jugadores: el id es secreto (vive en una cookie httpOnly) y nunca se expone.
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_key TEXT NOT NULL UNIQUE,
  created_at INTEGER NOT NULL
);

-- Una ronda = un intento. La respuesta correcta solo vive acá.
CREATE TABLE rounds (
  id TEXT PRIMARY KEY,
  player_id TEXT NOT NULL REFERENCES players(id),
  pokemon_id INTEGER NOT NULL,
  options TEXT NOT NULL,
  started_at INTEGER NOT NULL,
  answered_at INTEGER,
  chosen_id INTEGER,
  correct INTEGER NOT NULL DEFAULT 0,
  elapsed_ms INTEGER,
  points INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX rounds_player_started ON rounds (player_id, started_at);
CREATE INDEX rounds_started ON rounds (started_at);
