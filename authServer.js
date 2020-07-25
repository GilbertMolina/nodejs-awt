import dotenv from 'dotenv';
import express from "express";
import jwt from 'jsonwebtoken';

const result = dotenv.config();

if (result.error) {
  throw result.error
}

const app = express();
app.use(express.json());

const PORT = process.env.AUTH_SERVER_PORT || 4000;

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
};

const generateRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '60s' });
};

let refreshTokens = [];

app.post('/login', (req, res) => {
  const { username } = req.body;

  const user = { 
    name: username
  };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  refreshTokens.push(refreshToken);

  res.json({ access_token: accessToken, refresh_token: refreshToken });
});

app.post('/refreshAccessToken', (req, res) => {
  const refreshToken = req.body.refresh_token;

  if (refreshToken === null) return res.sendStatus(403);

  if (!refreshTokens.find(token => token === refreshToken)) return res.sendStatus(403);

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({ name: user.name })
    
    res.json({ access_token: accessToken });
  });
});

app.delete('/revokeRefreshToken', (req, res) => {
  const refreshToken = req.body.refresh_token;

  refreshTokens = refreshTokens.filter(token => token !== refreshToken);

  res.status(200).send('Refresh token successfully revoked');
});

app.listen(PORT);