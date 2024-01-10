// articleController.js
const { connectToDatabase } = require('./db');
const { Router } = require('express');
const multer = require('multer');
const path = require('path');

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../Client/carsell/public/img');
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.post('/upload', upload.single('image'), (req, res) => {
  try {
    const imageName = req.file.originalname;
    res.json({ imageName });
  } catch (error) {
    console.error('Error while uploading image:', error);
    res.status(500).json({ error: `Błąd podczas przesyłania obrazu: ${error.message}` });
  }
});

router.post('/createArticle', upload.single('image'), async (req, res) => {
  try {
    const db = await connectToDatabase();
    const article = db.collection('article');
    const { title, description, date, content } = req.body;

    if (!title || !description || !date || !content) {
      return res.status(400).json({ error: 'Title, description, date, and content are required fields.' });
    }

    const link = title.toLowerCase().replace(/\s+/g, '-');
    const imageName = req.file ? req.file.originalname : null;
    const imageNameWithoutExtension = imageName ? path.parse(imageName).name : null;

    const result = await article.insertOne({
      title,
      description,
      date,
      link,
      content,
      bannerImg: imageNameWithoutExtension,
    });

    if (!result.ops || result.ops.length === 0) {
      return res.status(500).json({ error: 'Failed to add the article.' });
    }

    res.json(result.ops[0]);
  } catch (error) {
    console.error('Error while processing request:', error);
    res.status(500).json({ error: `Błąd podczas tworzenia artykułu: ${error.message}` });
  }
});

router.get('/articles', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const article = db.collection('article');
    const articles = await article.find({}).sort({ date: -1 }).toArray();
    res.json(articles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania artykułów: ${error.message}` });
  }
});

router.get('/article/:link', async (req, res) => {
  try {
    const db = await connectToDatabase();
    const article = await db.collection('article').findOne({ link: req.params.link });

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    res.json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: `Wystąpił błąd podczas pobierania artykułu: ${error.message}` });
  }
});

module.exports = router;
