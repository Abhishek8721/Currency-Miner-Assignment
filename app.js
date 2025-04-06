const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./database');
require('dotenv').config();
const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY; 

app.use(express.json());


function calculateCoins(startTime) {
  const currentTime = new Date();
  const elapsedTime = (currentTime - new Date(startTime)) / 1000 / 60 / 60; 
  return Math.floor(elapsedTime) * 5; 
}

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').split(' ')[1]; // Bearer <token>
  if (!token) return res.status(403).send('Access denied. No token provided.');

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).send('Invalid token.');
    req.user = user;
    next();
  });
}

// Endpoint to register a new user
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required.');
  }


  const hashedPassword = bcrypt.hashSync(password, 10);


  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
    if (err) {
        console.error('Error creating user:', err.message);
        return res.status(500).send('Error creating user.')
    };

   
    const token = jwt.sign({ userId: this.lastID, username }, SECRET_KEY, { expiresIn: '1d' });

    res.status(201).send({ message: 'User registered successfully', token });
  });
});

// Endpoint to login a user and get a JWT token
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;


  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).send('Database error');
    if (!user) return res.status(400).send('User not found.');
    console.log(user);
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(400).send('Invalid password.');
    }


    const token = jwt.sign({ userId: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1d' });

    res.status(200).send({ message: 'Login successful', token });
  });
});

// Endpoint to start mining
app.post('/api/mine/start', authenticateToken, (req, res) => {
    const { username } = req.user;
  
   
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
      if (err) return res.status(500).send('Database error');
      
   
      if (!row) {
        return res.status(400).send('User not found. Please register first.');
      }
  

      const userId = row.id;  
      const startTime = new Date();
  
    
      db.run('INSERT INTO mining (user_id, start_time) VALUES (?, ?)', [userId, startTime], (err) => {
        if (err) return res.status(500).send('Error starting mining session');
        
        res.status(200).send({ message: 'Mining started', userId, startTime });
      });
    });
  });
  

// Endpoint to claim coins
app.post('/api/mine/claim', authenticateToken, (req, res) => {
  const { userId } = req.user;

  
  db.get('SELECT * FROM mining WHERE user_id = ?', [userId], (err, miningData) => {
    if (err) return res.status(500).send('Database error');
    if (!miningData) return res.status(404).send('User not mining');

  
    const earnedCoins = calculateCoins(miningData.start_time);

    
    const claimableCoins = Math.min(earnedCoins, 10);


    if (claimableCoins > 0) {
     
      db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [claimableCoins, userId], (err) => {
        if (err) return res.status(500).send('Error updating balance');
        const remainingCoins = earnedCoins - claimableCoins;
     
        db.run('UPDATE mining SET accumulated_coins = ?, start_time = ? WHERE user_id = ?', [remainingCoins, new Date(), userId], (err) => {
          if (err) return res.status(500).send('Error resetting mining session');
          
          res.status(200).send({ message: `Claimed ${claimableCoins} coins`, claimedCoins: claimableCoins });
        });
      });
    } else {
      res.status(400).send('No coins available to claim');
    }
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
