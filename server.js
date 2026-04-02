// server.js
const express = require("express");
const fileUpload = require("express-fileupload");
const sqlite3 = require("sqlite3").verbose();
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const path = require("path");
const PORT = process.env.PORT || 3000;

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "./tmp" }));
app.use(express.static(path.join(__dirname, "public")));

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
  console.error("Cloudinary keys are missing!");
  process.exit(1); // Stops app to prevent crashing later
}

// Database
const db = new sqlite3.Database("database.db");
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    image TEXT
  )`);
});

// Routes
app.get("/posts", (req, res) => {
  db.all(`SELECT id, title, description, image FROM posts ORDER BY id DESC`, [], (err, posts) => {
    if (err) return res.json([]);
    res.json(posts || []);
  });
});

app.post("/upload", async (req, res) => {
  console.log("REQ FILES:", req.files);

  if (!req.files || !req.files.image) {
    return res.json({ success: false, error: "No file uploaded" });
  }

  try {
    const file = req.files.image;
    const { title, description } = req.body;

    console.log("TEMP FILE PATH:", file.tempFilePath);

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: "social_feed"
    });

    db.run(`INSERT INTO posts (title, description, image) VALUES (?, ?, ?)`,
      [title, description, result.secure_url],
      function(err) {
        if (err) return res.json({ success: false, error: err.message });
        res.json({ success: true, postId: this.lastID, imageUrl: result.secure_url });
      }
    );
  } catch (err) {
    console.error("UPLOAD ERROR:", err);
    res.json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));