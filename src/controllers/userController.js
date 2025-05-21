// src/controllers/userController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sql, poolPromise } from "../config/dbConfig.js";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(
        `SELECT id, nombre, email, rol
         FROM dbo.UsersJorge
         ORDER BY id`
      );
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ message: "Error interno al listar usuarios" });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(
        `SELECT id, nombre, email, rol
         FROM dbo.UsersJorge
         WHERE id = @id`
      );

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error al obtener usuario:", err);
    res.status(500).json({ message: "Error interno al obtener usuario" });
  }
};

// Crear un usuario nuevo
export const createUser = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("nombre", sql.VarChar(255), nombre)
      .input("email", sql.VarChar(255), email)
      .input("password", sql.VarChar(255), hashedPass)
      .input("rol", sql.VarChar(50), rol)
      .query(`
        INSERT INTO dbo.UsersJorge (nombre, email, password, rol)
        VALUES (@nombre, @email, @password, @rol);
        SELECT
          CAST(SCOPE_IDENTITY() AS INT) AS id,
          @nombre    AS nombre,
          @email     AS email,
          @rol       AS rol;
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Error al crear usuario:", err);
    res.status(500).json({ message: "Error interno al crear usuario" });
  }
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol } = req.body;
  try {
    const pool = await poolPromise;
    let request = pool.request()
      .input("id", sql.Int, id)
      .input("nombre", sql.VarChar(255), nombre)
      .input("email", sql.VarChar(255), email)
      .input("rol", sql.VarChar(50), rol);

    let query;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
      request = request.input("password", sql.VarChar(255), hashedPass);
      query = `
        UPDATE dbo.UsersJorge
        SET nombre = @nombre,
            email = @email,
            password = @password,
            rol = @rol
        WHERE id = @id;
        SELECT id, nombre, email, rol
        FROM dbo.UsersJorge
        WHERE id = @id;
      `;
    } else {
      query = `
        UPDATE dbo.UsersJorge
        SET nombre = @nombre,
            email = @email,
            rol = @rol
        WHERE id = @id;
        SELECT id, nombre, email, rol
        FROM dbo.UsersJorge
        WHERE id = @id;
      `;
    }

    const result = await request.query(query);
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ message: "Error interno al actualizar usuario" });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        DELETE FROM dbo.UsersJorge
        WHERE id = @id;
        SELECT @id AS id;
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ message: "Error interno al eliminar usuario" });
  }
};

// Login de usuario
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.VarChar(255), email)
      .query(`
        SELECT id, nombre, email, password, rol
        FROM dbo.UsersJorge
        WHERE email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.json({ token });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ message: "Error interno al autenticar" });
  }
};
