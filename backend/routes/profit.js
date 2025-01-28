const express = require("express");
const connection = require("../config/dbConnection");
const router = express.Router();
router.use(express.json());

router.get("/", (req, res) => {
  const query = `
        SELECT
            all_months.month,
            COALESCE(purchases.total_purchases, 0) AS total_purchases,
            COALESCE(expenses.total_expenses, 0) AS total_expenses,
            COALESCE(sales.total_sales, 0) AS total_sales,
            (COALESCE(sales.total_sales, 0) - (COALESCE(purchases.total_purchases, 0) + COALESCE(expenses.total_expenses, 0))) AS profit
        FROM
            (
                SELECT DISTINCT DATE_FORMAT(purchase_date, '%Y-%m') AS month FROM purchases
                UNION
                SELECT DISTINCT DATE_FORMAT(Date, '%Y-%m') AS month FROM expenses
                UNION
                SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') AS month FROM sales
            ) AS all_months
        LEFT JOIN
            (
                SELECT 
                    DATE_FORMAT(purchase_date, '%Y-%m') AS month, 
                    SUM(price) AS total_purchases
                FROM purchases
                GROUP BY DATE_FORMAT(purchase_date, '%Y-%m')
            ) AS purchases
        ON all_months.month = purchases.month
        LEFT JOIN
            (
                SELECT 
                    DATE_FORMAT(Date, '%Y-%m') AS month, 
                    SUM(Price) AS total_expenses
                FROM expenses
                GROUP BY DATE_FORMAT(Date, '%Y-%m')
            ) AS expenses
        ON all_months.month = expenses.month
        LEFT JOIN
            (
                SELECT 
                    DATE_FORMAT(date, '%Y-%m') AS month, 
                    SUM(total_price) AS total_sales
                FROM sales
                GROUP BY DATE_FORMAT(date, '%Y-%m')
            ) AS sales
        ON all_months.month = sales.month
        ORDER BY all_months.month;
    `;

  connection.query(query, (error, results) => {
    if (error) {
      console.error("Detailed Profit Fetch Error:", {
        message: error.message,
        sql: error.sql,
        sqlState: error.sqlState,
        code: error.code,
      });
      return res.status(500).json({
        message: "Error fetching profits",
        error: error.message,
      });
    }

    // Add some logging to understand the data
    console.log(
      "Profit Calculation Results:",
      JSON.stringify(results, null, 2)
    );

    // Process results to ensure proper formatting
    const processedResults = results.map((result) => ({
      month: result.month,
      total_purchases: parseFloat(result.total_purchases).toFixed(2),
      total_expenses: parseFloat(result.total_expenses).toFixed(2),
      total_sales: parseFloat(result.total_sales).toFixed(2),
      profit: parseFloat(result.profit).toFixed(2),
    }));

    return res.json(processedResults);
  });
});

module.exports = router;
