const express = require('express');
var cors = require('cors');
const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: false}));


app.use('/api/lamda', require('./routes/lamda-api.js'));


const PORT = 5000;

app.listen(PORT, () => console.log('Server started on port ' + PORT));

