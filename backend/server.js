const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Serve frontend files under /form
app.use("/form", express.static(path.join(__dirname, "../public")));

// API route under /form/api
app.use("/form/api", require("./routes/form"));

// Health check - open https://gist.aeronica.in/form
app.get("/form", (req, res) => {
  res.send("Aeronica Form Backend Running...");
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
