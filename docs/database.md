# Database: KrishiSetu (SQLite)

File: `krishisetu.db`. Created by `python db.py`, which runs `schema.sql` then `seed.sql`.

## 1. Tables overview
| Table | Purpose |
|---|---|
| users | Farmers and buyers (role field) |
| sellers | Krishibhavans, cooperative societies, private shops that sell inputs |
| inputs | Seeds, manure, fertilizer sold by sellers |
| produce | Listings posted by farmers (crops, vegetables, eggs, milk) |
| orders | One order per checkout |
| order_items | Lines inside an order |
| vets | Veterinary doctor directory |
| diseases | Condition names and advice used by Crop Doctor |
| scans | History of Crop Doctor results per farmer |

## 2. Schema (`schema.sql`)
```sql
PRAGMA foreign_keys = ON;

CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('farmer','buyer')),
  district      TEXT,
  village       TEXT,
  created_at    TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sellers (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  seller_type TEXT NOT NULL CHECK (seller_type IN ('krishibhavan','society','private')),
  district    TEXT NOT NULL,
  address     TEXT,
  phone       TEXT
);

CREATE TABLE inputs (
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

CREATE TABLE produce (
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

CREATE TABLE orders (
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

CREATE TABLE order_items (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_type   TEXT NOT NULL CHECK (item_type IN ('input','produce')),
  item_id     INTEGER NOT NULL,
  item_name   TEXT NOT NULL,            -- copied at purchase time
  unit_price  REAL NOT NULL,
  quantity    REAL NOT NULL CHECK (quantity > 0)
);

CREATE TABLE vets (
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

CREATE TABLE diseases (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  code        TEXT NOT NULL UNIQUE,     -- healthy, leaf_spot, powdery, yellowing, mixed, unclear
  title       TEXT NOT NULL,
  description TEXT,
  advice      TEXT NOT NULL             -- bullet lines separated by newline
);

CREATE TABLE scans (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id        INTEGER NOT NULL REFERENCES users(id),
  image_path     TEXT,
  condition_code TEXT,
  confidence     TEXT,
  severity       TEXT,
  affected_pct   REAL,
  created_at     TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inputs_cat     ON inputs(category);
CREATE INDEX idx_produce_cat    ON produce(category, is_active);
CREATE INDEX idx_vets_spec      ON vets(specialty, district);
CREATE INDEX idx_orders_user    ON orders(user_id);
```

## 3. Relationships
```
users 1---* produce        users 1---* orders 1---* order_items
users 1---* scans          sellers 1---* inputs
vets, diseases: standalone lookup tables
```

## 4. Seed data (`seed.sql`): all SAMPLE / DUMMY
Add with realistic Kerala flavour and clearly mark as sample in the UI.
- **sellers** (6): 2 Krishibhavans, 2 co-operative societies, 2 private shops across districts such as Ernakulam, Idukki, Kottayam, Thrissur.
- **inputs** (about 20): seeds (okra, chilli, cowpea, banana sucker, paddy), manure (cow dung, vermicompost, neem cake, poultry manure), fertilizer (urea, factomphos, potash, bio-fertilizer).
- **produce** (about 12) under 2-3 sample farmer accounts: vegetables, bananas, eggs (per dozen), milk (per litre), rice.
- **vets** (8): at least 3 poultry, 3 dairy, 1 goat, 1 general, with dummy phone numbers (use clearly fake numbers).
- **diseases** (6 rows): `healthy`, `leaf_spot`, `powdery`, `yellowing`, `mixed`, `unclear`, each with advice, for example:
  - leaf_spot: remove affected leaves, avoid overhead watering, improve spacing, consult the Krishibhavan before using any fungicide.
  - powdery: improve air flow, avoid excess nitrogen, consult the agricultural officer for the right treatment.
  - yellowing: check water logging, consider soil testing, balanced manure; if spread is patchy and sudden, show a sample to the Krishibhavan.
- Demo accounts: one farmer, one buyer (password documented in README, dummy only).

## 5. Rules
- **Prices are re-read from the database at checkout**, never taken from the browser.
- Stock is reduced when an order is placed; reject if insufficient.
- `item_name` and `unit_price` are copied into `order_items` so old orders do not change.
- Passwords stored only as hashes.
- `*.db` is git-ignored; teammates run `python db.py` to rebuild locally.
