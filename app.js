const express = require('express');
const cors = require('cors');
require("dotenv").config();
const bodyParser = require('body-parser');
const userRoute = require("./src/controllers/user-controller");

const PORT = 4000;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api/v1/users", userRoute);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.use("/api/user", userRoute);
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
