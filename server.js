const express = require('express');
const connectDB = require('./config/db');

const app = express();

//DB connection
connectDB();

//init  middleware

app.use(express.json({
    extended: false
}));

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5000;

//Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));

app.listen(PORT, () => console.log('Server Started on port ' + PORT));