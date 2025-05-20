
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/dbConfig.js";

// Obtener todos los usuarios
export const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ message: 'Error interno al listar usuarios' });
  }
};

// Obtener un usuario por ID
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ message: 'Error interno al obtener usuario' });
  }
};

// Crear un usuario nuevo
export const createUser = async (req, res) => {
  const { nombre, email, password, rol } = req.body;
  try {
    // Hashear contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPass = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id, nombre, email, rol`,
      [nombre, email, hashedPass, rol]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear usuario:', err);
    res.status(500).json({ message: 'Error interno al crear usuario' });
  }
};

// Actualizar un usuario existente
export const updateUser = async (req, res) => {
  const { id } = req.params;
  const { nombre, email, password, rol } = req.body;
  try {
    let query, params;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPass = await bcrypt.hash(password, salt);
      query = `
        UPDATE usuarios
        SET nombre=$1, email=$2, password=$3, rol=$4
        WHERE id=$5
        RETURNING id, nombre, email, rol
      `;
      params = [nombre, email, hashedPass, rol, id];
    } else {
      query = `
        UPDATE usuarios
        SET nombre=$1, email=$2, rol=$3
        WHERE id=$4
        RETURNING id, nombre, email, rol
      `;
      params = [nombre, email, rol, id];
    }
    const result = await pool.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ message: 'Error interno al actualizar usuario' });
  }
};

// Eliminar un usuario
export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM usuarios WHERE id=$1 RETURNING id',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    res.status(500).json({ message: 'Error interno al eliminar usuario' });
  }
};

// Login de usuario
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, password FROM usuarios WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }
    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales incorrectas' });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({ token });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ message: 'Error interno al autenticar' });
  }
};
