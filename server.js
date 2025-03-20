const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routes = require("./routes");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/", routes);

app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
