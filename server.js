// server.js
const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const Database = require("better-sqlite3");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({ useTempFiles: true, tempFileDir: "./temp" }));
app.use(express.static(path.join(__dirname, "public")));

// Ensure temp folder exists
if (!fs.existsSync("./temp")) fs.mkdirSync("./temp");

// Cloudinary config (set via Render environment variables)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_KEY || !process.env.CLOUDINARY_SECRET) {
  console.error("Cloudinary keys are missing!");
  process.exit(1);
}

// Database
const db = new Database("database.db");

// Create tables if not exist
db.exec(`
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  description TEXT,
  image TEXT
);

CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id INTEGER,
  text TEXT
);
`);

// ROUTES

// GET all posts with comments
app.get("/posts", (req, res) => {
  try {
    const posts = db.prepare(`
      SELECT id, title, description, image
      FROM posts
      ORDER BY id DESC
    `).all();

    posts.forEach(post => {
      const comments = db.prepare(`
        SELECT text FROM comments WHERE post_id = ?
      `).all(post.id);
      post.comments = comments;
    });

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.json([]);
  }
});

// POST a new post
app.post("/upload", async (req, res) => {
  try {
    const { title, description } = req.body;
    const file = req.files?.image;
    if (!file) return res.json({ success: false, error: "No file uploaded" });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.tempFilePath);
    const imageUrl = result.secure_url;

    // Insert into DB
    db.prepare(`
      INSERT INTO posts (title, description, image)
      VALUES (?, ?, ?)
    `).run(title, description, imageUrl);

    // Delete temp file
    fs.unlinkSync(file.tempFilePath);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

// POST a comment
app.post("/comment", (req, res) => {
  try {
    const { post_id, text } = req.body;
    db.prepare(`
      INSERT INTO comments (post_id, text)
      VALUES (?, ?)
    `).run(post_id, text);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, error: err.message });
  }
});

// DYNAMIC PORT for Render
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));