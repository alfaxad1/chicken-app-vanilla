const express = require("express");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());

//save
router.post("/", (req, res) => {
  const { product, qty, price, date } = req.body;
  const query =
    "INSERT INTO batch_purchases (product_name, quantity, price, purchase_date) VALUES (?, ?, ?, ?)";
  connection.query(query, [product, qty, price, date], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Purchase Saved Successfully" });
  });
});

//delete
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM batch_purchases WHERE id = ?";

  connection.query(query, [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Purchase Deleted Successfully" });
  });
});

//get
router.get("/", (req, res) => {
  const query = "SELECT * FROM batch_purchases";
  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(results);
  });
});

//get by id
router.get("/:id", (req, res) => {
  const { id } = req.params;
  const query = "SELECT * FROM batch_purchases WHERE id = ?";
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(results);
  });
});

//update
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { product_name, quantity, price, purchase_date } = req.body;
  const query =
    "UPDATE batch_purchases SET product_name = ?, quantity = ?, price = ?, purchase_date = ? WHERE id = ?";

  connection.query(
    query,
    [product_name, quantity, price, purchase_date, id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Purchase not found" });
      }
      return res.status(200).json({ message: "Purchase Updated Successfully" });
    }
  );
});

module.exports = router;
