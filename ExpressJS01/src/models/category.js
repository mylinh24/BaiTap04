const pool = require("../config/database");

async function getAllCategories() {
  const [rows] = await pool.execute("SELECT * FROM categories");
  return rows;
}


async function createCategory(name, description) {
  const [result] = await pool.execute(
    "INSERT INTO categories (name, description) VALUES (?, ?)",
    [name, description]
  );
  return { id: result.insertId, name, description };
}


async function getCategoryById(id) {
  const [rows] = await pool.execute("SELECT * FROM categories WHERE id = ?", [id]);
  return rows[0];
}


async function updateCategory(id, name, description) {
  await pool.execute(
    "UPDATE categories SET name = ?, description = ? WHERE id = ?",
    [name, description, id]
  );
  return { id, name, description };
}


async function deleteCategory(id) {
  await pool.execute("DELETE FROM categories WHERE id = ?", [id]);
  return true;
}

module.exports = {
  getAllCategories,
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory
};
