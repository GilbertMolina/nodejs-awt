import env from 'dotenv';
import express from "express";
import jwt from 'jsonwebtoken';
import users from './posts.js';

const result = env.config();

if (result.error) {
  throw result.error
}

const app = express();
app.use(express.json());

const PORT = process.env.SERVER_PORT || 3000;

const authenticateToken = (req, res, next) => {
  console.log('req.headers', req.headers)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token === null) return res.sendStatus(401);
  
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    req.user = user;

    next();
  });
};

app.get('/posts', authenticateToken, (req, res) => {
  res.json(users.filter(post => post.username === req.user.name));
});

app.listen(PORT);