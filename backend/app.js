const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static("public"));

const purchases = require("./routes/purchases");
const sales = require("./routes/sales");
const profit = require("./routes/profit");
const expenses = require("./routes/expenses");
const eggCollection = require("./routes/eggCollection");
const chickenPurchases = require("./routes/chickenPurchase");
const users = require("./routes/users");
const chickenLoss = require("./routes/chickenLoss");
const batchPurchases = require("./routes/batch-purchases");

app.use("/api/purchases", purchases);
app.use("/api/sales", sales);
app.use("/api/profits", profit);
app.use("/api/expenses", expenses);
app.use("/api/egg-collection", eggCollection);
app.use("/api/chicken-purchases", chickenPurchases);
app.use("/api/users", users);
app.use("/api/chicken-loss", chickenLoss);
app.use("/api/batch-purchases", batchPurchases);

const PORT = process.env.PORT;
const appName = process.env.APP_NAME;

app.listen(PORT, () => {
  console.log(`${appName} is running on port ${PORT}`);
});
