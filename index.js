const express = require('express');
const app = express();
const matchingNameRoute = require('./matchingNameRoute');
const cors = require('cors');

app.use(cors());

app.use(express.json());
app.use('/api', matchingNameRoute);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));