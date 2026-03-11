import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("golf.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS distances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    club TEXT NOT NULL,
    distance REAL NOT NULL,
    direction TEXT,
    hit_point TEXT,
    trajectory TEXT,
    wind TEXT,
    temperature REAL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    notes TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS clubs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    model TEXT,
    shaft TEXT,
    grip TEXT,
    notes TEXT,
    color TEXT DEFAULT '#10B981',
    in_bag INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0
  );
`);

// Migration: Add missing columns if they don't exist
const tableInfoDistances = db.prepare("PRAGMA table_info(distances)").all() as any[];
const columnsDistances = tableInfoDistances.map(c => c.name);

if (!columnsDistances.includes('direction')) {
  db.exec("ALTER TABLE distances ADD COLUMN direction TEXT");
}
if (!columnsDistances.includes('hit_point')) {
  db.exec("ALTER TABLE distances ADD COLUMN hit_point TEXT");
}
if (!columnsDistances.includes('trajectory')) {
  db.exec("ALTER TABLE distances ADD COLUMN trajectory TEXT");
}
if (!columnsDistances.includes('wind')) {
  db.exec("ALTER TABLE distances ADD COLUMN wind TEXT");
}
if (!columnsDistances.includes('temperature')) {
  db.exec("ALTER TABLE distances ADD COLUMN temperature REAL");
}

const tableInfoClubs = db.prepare("PRAGMA table_info(clubs)").all() as any[];
const columnsClubs = tableInfoClubs.map(c => c.name);

if (!columnsClubs.includes('color')) {
  db.exec("ALTER TABLE clubs ADD COLUMN color TEXT DEFAULT '#10B981'");
}
if (!columnsClubs.includes('in_bag')) {
  db.exec("ALTER TABLE clubs ADD COLUMN in_bag INTEGER DEFAULT 1");
}
if (!columnsClubs.includes('sort_order')) {
  db.exec("ALTER TABLE clubs ADD COLUMN sort_order INTEGER DEFAULT 0");
}
if (!columnsClubs.includes('custom_name')) {
  db.exec("ALTER TABLE clubs ADD COLUMN custom_name TEXT");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/distances", (req, res) => {
    const rows = db.prepare("SELECT * FROM distances ORDER BY date DESC").all();
    res.json(rows);
  });

  app.post("/api/distances", (req, res) => {
    const { club, distance, direction, hit_point, trajectory, wind, temperature } = req.body;
    const info = db.prepare(`
      INSERT INTO distances (club, distance, direction, hit_point, trajectory, wind, temperature) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(club, distance, direction, hit_point, trajectory, wind, temperature);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/distances/:id", (req, res) => {
    const { club, distance, direction, hit_point, trajectory, wind, temperature } = req.body;
    db.prepare(`
      UPDATE distances 
      SET club = ?, distance = ?, direction = ?, hit_point = ?, trajectory = ?, wind = ?, temperature = ?
      WHERE id = ?
    `).run(club, distance, direction, hit_point, trajectory, wind, temperature, req.params.id);
    res.sendStatus(200);
  });

  app.delete("/api/distances/:id", (req, res) => {
    db.prepare("DELETE FROM distances WHERE id = ?").run(req.params.id);
    res.sendStatus(200);
  });

  app.get("/api/stats", (req, res) => {
    const stats = db.prepare(`
      SELECT 
        d.club, 
        AVG(d.distance) as avg_distance, 
        MAX(d.distance) as max_distance, 
        COUNT(*) as count,
        c.color,
        c.in_bag
      FROM distances d
      LEFT JOIN clubs c ON d.club = c.name
      GROUP BY d.club
    `).all();
    res.json(stats);
  });

  app.get("/api/clubs", (req, res) => {
    const rows = db.prepare("SELECT * FROM clubs ORDER BY sort_order ASC, name ASC").all();
    res.json(rows);
  });

  app.post("/api/clubs", (req, res) => {
    const { name, custom_name, brand, model, shaft, grip, notes, color, in_bag } = req.body;
    const maxOrder = db.prepare("SELECT MAX(sort_order) as maxOrder FROM clubs").get() as { maxOrder: number | null };
    const nextOrder = (maxOrder.maxOrder || 0) + 1;
    
    const info = db.prepare(`
      INSERT INTO clubs (name, custom_name, brand, model, shaft, grip, notes, color, in_bag, sort_order) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, custom_name, brand, model, shaft, grip, notes, color || '#10B981', in_bag !== undefined ? in_bag : 1, nextOrder);
    res.json({ id: info.lastInsertRowid });
  });

  app.put("/api/clubs/:id", (req, res) => {
    const { name, custom_name, brand, model, shaft, grip, notes, color, in_bag } = req.body;
    db.prepare(`
      UPDATE clubs 
      SET name = ?, custom_name = ?, brand = ?, model = ?, shaft = ?, grip = ?, notes = ?, color = ?, in_bag = ?
      WHERE id = ?
    `).run(name, custom_name, brand, model, shaft, grip, notes, color, in_bag, req.params.id);
    res.sendStatus(200);
  });

  app.delete("/api/clubs/:id", (req, res) => {
    db.prepare("DELETE FROM clubs WHERE id = ?").run(req.params.id);
    res.sendStatus(200);
  });

  app.put("/api/clubs/reorder", (req, res) => {
    const { clubIds } = req.body;
    const update = db.prepare("UPDATE clubs SET sort_order = ? WHERE id = ?");
    const transaction = db.transaction((ids) => {
      ids.forEach((id: number, index: number) => {
        update.run(index, id);
      });
    });
    transaction(clubIds);
    res.sendStatus(200);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
