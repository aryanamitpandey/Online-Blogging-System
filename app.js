const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();


mongoose.connect('mongodb://127.0.0.1:27017/blogPlatform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  imagePath: String,
});
const Blog = mongoose.model('Blog', blogSchema);


app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });


app.get('/', async (req, res) => {
  const posts = await Blog.find().sort({ _id: -1 });

  let html = `
  <html>
  <head>
    <title>Simple Blog</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f4f4;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: center;
      }
      .container {
        width: 90%;
        max-width: 700px;
        margin-top: 30px;
        background: #fff;
        padding: 20px;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
      h1 {
        text-align: center;
        color: #333;
      }
      .post {
        margin-top: 30px;
        border-top: 1px solid #ccc;
        padding-top: 20px;
      }
      img {
        max-width: 100%;
        max-height: 400px;
        object-fit: contain;
        display: block;
        margin: 15px auto;
        border-radius: 10px;
      }
      input[type="text"], textarea {
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        margin-bottom: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 16px;
      }
      button, .button {
        padding: 10px 20px;
        background: #007bff;
        color: #fff;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        text-decoration: none;
        display: inline-block;
        margin-top: 10px;
        text-align: center;
      }
      button:hover, .button:hover {
        background: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>📝 My Simple Blog</h1>
      <a href="/create" class="button">Create New Post</a>
  `;

  posts.forEach(post => {
    html += `
      <div class="post">
        <h2>${post.title}</h2>
        <p>${post.content}</p>
        ${post.imagePath ? `<img src="${post.imagePath}" alt="Image" />` : ''}
      </div>
    `;
  });

  html += `
    </div>
  </body>
  </html>
  `;

  res.send(html);
});


app.get('/create', (req, res) => {
  res.send(`
  <html>
  <head>
    <title>Create Post</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background: #f4f4f4;
        display: flex;
        justify-content: center;
        margin: 0;
        padding: 0;
      }
      .container {
        width: 90%;
        max-width: 600px;
        background: white;
        padding: 20px;
        margin-top: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
      }
      h1 {
        text-align: center;
      }
      input[type="text"], textarea {
        width: 100%;
        padding: 10px;
        margin-top: 10px;
        margin-bottom: 15px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 16px;
      }
      button {
        padding: 10px 20px;
        background: #007bff;
        color: #fff;
        font-size: 16px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        display: block;
        margin: 0 auto;
      }
      button:hover {
        background: #0056b3;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Create a New Blog Post</h1>
      <form method="POST" action="/create" enctype="multipart/form-data">
        <input type="text" name="title" placeholder="Enter title" required />
        <textarea name="content" rows="5" placeholder="Enter your content here" required></textarea>
        <input type="file" name="image" accept="image/*" />
        <button type="submit">Publish</button>
      </form>
    </div>
  </body>
  </html>
  `);
});


app.post('/create', upload.single('image'), async (req, res) => {
  const newPost = new Blog({
    title: req.body.title,
    content: req.body.content,
    imagePath: req.file ? '/uploads/' + req.file.filename : null,
  });

  await newPost.save();
  res.redirect('/');
});


app.listen(3000, () => {
  console.log('✅ Blog is running at http://localhost:3000');
});
