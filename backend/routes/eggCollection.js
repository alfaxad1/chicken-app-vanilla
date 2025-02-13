const express = require("express");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());

// Save egg collection
router.post("/", (req, res) => {
  const { collection_date, eggs_collected, damaged_eggs } = req.body;
  const query =
    "INSERT INTO egg_collection (collection_date, eggs_collected, damaged_eggs) VALUES (?, ?, ?)";

  connection.query(
    query,
    [collection_date, eggs_collected, damaged_eggs],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      return res
        .status(200)
        .json({ message: "Collection recorded successfully" });
    }
  );
});

// Get all egg collections
router.get("/", (req, res) => {
  const query = "SELECT * FROM egg_collection ORDER BY collection_date DESC";

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(results);
  });
});

// Get current month's egg collections
router.get("/monthly", (req, res) => {
  const query = `
        SELECT collection_date, eggs_collected 
        FROM egg_collection 
        WHERE MONTH(collection_date) = MONTH(CURRENT_DATE()) 
        AND YEAR(collection_date) = YEAR(CURRENT_DATE())
        ORDER BY collection_date ASC
    `;

  connection.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json(results);
  });
});

// Delete egg collection
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM egg_collection WHERE id = ?";

  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    return res.status(200).json({ message: "Collection deleted successfully" });
  });
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  const { date, collectedEggs, damagedEggs } = req.body;
  const query =
    "UPDATE egg_collection SET eggs_collected = ?, collection_date = ?, damaged_eggs = ?  WHERE id = ?";
  connection.query(
    query,
    [collectedEggs, date, damagedEggs, id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      }
      return res
        .status(200)
        .json({ message: "Collection updated successfully" });
    }
  );
});

module.exports = router;
