const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", require("./routes/form"));

app.get("/", (req, res) => {
  res.send("Aeronica Backend Running...");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
