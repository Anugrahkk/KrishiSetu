PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('farmer','buyer')),
  district      TEXT,
  village       TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sellers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('krishibhavan','society','private')),
  district    TEXT NOT NULL,
  address     TEXT,
  phone       TEXT
);

CREATE TABLE IF NOT EXISTS inputs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id   INTEGER NOT NULL REFERENCES sellers(id),
  category    TEXT NOT NULL CHECK (category IN ('seed','manure','fertilizer')),
  name        TEXT NOT NULL,
  description TEXT,
  price       REAL NOT NULL CHECK (price >= 0),
  unit        TEXT NOT NULL,            -- kg, packet, bag, litre
  stock       INTEGER NOT NULL DEFAULT 0,
  image       TEXT
);

CREATE TABLE IF NOT EXISTS produce (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id   INTEGER NOT NULL REFERENCES users(id),
  category    TEXT NOT NULL CHECK (category IN ('crop','vegetable','fruit','egg','milk','other')),
  name        TEXT NOT NULL,
  price       REAL NOT NULL CHECK (price >= 0),
  unit        TEXT NOT NULL,            -- kg, dozen, piece, litre
  quantity    REAL NOT NULL DEFAULT 0,
  district    TEXT,
  description TEXT,
  image       TEXT,
  is_active   INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  order_type  TEXT NOT NULL CHECK (order_type IN ('input','produce')),
  total       REAL NOT NULL,
  status      TEXT NOT NULL DEFAULT 'placed'
              CHECK (status IN ('placed','confirmed','completed','cancelled')),
  contact_name TEXT,
  contact_phone TEXT,
  address     TEXT,
  created_at  TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type   TEXT NOT NULL CHECK (item_type IN ('input','produce')),
  item_id     INTEGER NOT NULL,
  item_name   TEXT NOT NULL,            -- copied at purchase time
  unit_price  REAL NOT NULL,
  quantity    REAL NOT NULL CHECK (quantity > 0)
);

CREATE TABLE IF NOT EXISTS vets (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  clinic      TEXT,
  specialty   TEXT NOT NULL CHECK (specialty IN ('poultry','dairy','goat','general')),
  phone       TEXT NOT NULL,
  district    TEXT NOT NULL,
  address     TEXT,
  timings     TEXT,
  notes       TEXT
);

CREATE TABLE IF NOT EXISTS diseases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,     -- healthy, leaf_spot, powdery, yellowing, mixed, unclear
  title       TEXT NOT NULL,
  description TEXT,
  advice      TEXT NOT NULL             -- bullet lines separated by newline
);

CREATE TABLE IF NOT EXISTS scans (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  image_path     TEXT,
  condition_code TEXT,
  confidence     TEXT,
  severity       TEXT,
  affected_pct   REAL,
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_inputs_cat     ON inputs(category);
CREATE INDEX IF NOT EXISTS idx_produce_cat    ON produce(category, is_active);
CREATE INDEX IF NOT EXISTS idx_vets_spec      ON vets(specialty, district);
CREATE INDEX IF NOT EXISTS idx_orders_user    ON orders(user_id);

