const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

//  Railway uses dynamic PORT
const PORT = process.env.PORT || 4000;

// Never hardcode secrets
const SECRET_KEY = process.env.SECRET_KEY || 'dev_secret_key';

app.use(cors());
app.use(bodyParser.json());

// Mock Data
let users = [
  { id: 1, username: 'admin', password: 'password' }
];

let tasks = [
  {
    id: 1,
    title: "Doctor Appointment",
    description: "Visit Dr. Smith at 5 PM",
    isCompleted: false,
    remarks: "",
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Buy Groceries",
    description: "Milk, Bread, Eggs",
    isCompleted: true,
    remarks: "Done",
    updatedAt: new Date().toISOString()
  }
];

// Token middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(403);

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = jwt.sign(
    { id: user.id, username: user.username },
    SECRET_KEY,
    { expiresIn: '1h' }
  );

  res.json({
    token,
    user: { id: user.id, username: user.username }
  });
});

// Get tasks
app.get('/tasks', verifyToken, (req, res) => {
  res.json({ data: tasks });
});

// Create task
app.post('/tasks', verifyToken, (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    description: req.body.description,
    isCompleted: false,
    remarks: "",
    updatedAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.json({ data: newTask });
});

// Update task
app.put('/tasks/:id', verifyToken, (req, res) => {
  const id = Number(req.params.id);
  const index = tasks.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks[index] = {
    ...tasks[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  res.json({ data: tasks[index] });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
