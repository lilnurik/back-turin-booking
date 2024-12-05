// const express = require("express");
// const cors = require("cors");
// const { MongoClient, ObjectId } = require("mongodb");
// const xlsx = require("xlsx");

// const app = express();
// const PORT = 4000;

// // Используем встроенный body-parser
// app.use(cors());
// app.use(express.json());

// // Подключение к MongoDB
// const mongoUri = "mongodb+srv://polito_admin:polito_admin_password@cluster0.lbz3s.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// const client = new MongoClient(mongoUri);

// let db;

// async function connectToDatabase() {
//   try {
//     await client.connect();
//     db = client.db("real_database_name"); // Название вашей базы данных
//     console.log("Успешное подключение к базе данных MongoDB");
//   } catch (err) {
//     console.error("Ошибка подключения к базе данных:", err);
//     process.exit(1); // Завершаем процесс при ошибке подключения
//   }
// }

// connectToDatabase();

// // Простая аутентификация администратора
// const adminCredentials = {
//   username: "polito@admin",
//   password: "Turin@2024admin",
// };

// // Проверка прав администратора
// const isAdmin = (req, res, next) => {
//   const { username, password } = req.body;
//   if (
//     username === adminCredentials.username &&
//     password === adminCredentials.password
//   ) {
//     next();
//   } else {
//     return res.status(403).json({ message: "Доступ запрещен. Необходимы права администратора." });
//   }
// };

// // Логин администратора
// app.post("/admin/login", (req, res) => {
//   const { username, password } = req.body;
//   if (
//     username === adminCredentials.username &&
//     password === adminCredentials.password
//   ) {
//     return res.json({ message: "Успешный вход в админ-панель" });
//   } else {
//     return res.status(403).json({ message: "Неверные учетные данные" });
//   }
// });

// // Добавление события
// app.post("/events", async (req, res) => {
//   const { name, studentid, date, startTime, endTime, comment, selectedOption } = req.body;

//   if (!name || !studentid || !date || !startTime || !endTime || !selectedOption) {
//     return res.status(400).json({ message: "Все поля обязательны для заполнения." });
//   }

//   const newEvent = { name, studentid, date, startTime, endTime, comment, selectedOption };

//   try {
//     const result = await db.collection("events").insertOne(newEvent);
//     res.status(201).json({ id: result.insertedId, ...newEvent }); // Убедитесь, что вы возвращаете ID
//   } catch (err) {
//     console.error("Ошибка при добавлении события:", err);
//     res.status(500).json({ message: "Ошибка при добавлении события." });
//   }
// });

// // Получение всех событий
// app.get("/events", async (req, res) => {
//   try {
//     const events = await db.collection("events").find().toArray();
//     res.json(events);
//   } catch (err) {
//     console.error("Ошибка при получении событий:", err);
//     res.status(500).json({ message: "Ошибка при получении событий." });
//   }
// });

// // Обновление события
// app.put("/events/:id", async (req, res) => {
//   const { id } = req.params;
//   const { name, studentid, date, startTime, endTime, comment, selectedOption } = req.body;

//   if (!ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Неверный ID события." });
//   }

//   const updatedEvent = { name, studentid, date, startTime, endTime, comment, selectedOption };

//   try {
//     const result = await db.collection("events").updateOne(
//       { _id: new ObjectId(id) },
//       { $set: updatedEvent }
//     );

//     if (result.matchedCount === 0) {
//       return res.status(404).json({ message: "Событие не найдено." });
//     }

//     res.json({ id, ...updatedEvent });
//   } catch (err) {
//     console.error("Ошибка при обновлении события:", err);
//     res.status(500).json({ message: "Ошибка при обновлении события." });
//   }
// });

// // Удаление события
// app.delete("/events/:id", async (req, res) => {
//   const { id } = req.params;

//   if (!ObjectId.isValid(id)) {
//     return res.status(400).json({ message: "Неверный ID события." });
//   }

//   try {
//     const result = await db.collection("events").deleteOne({ _id: new ObjectId(id) });

//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "Событие не найдено." });
//     }

//     res.status(204).send();
//   } catch (err) {
//     console.error("Ошибка при удалении события:", err);
//     res.status(500).json({ message: "Ошибка при удалении события." });
//   }
// });

// // Экспорт событий в Excel
// app.get("/export", async (req, res) => {
//   try {
//     const events = await db.collection("events").find().toArray();
//     const worksheet = xlsx.utils.json_to_sheet(events);
//     const workbook = xlsx.utils.book_new();
//     xlsx.utils.book_append_sheet(workbook, worksheet, "Events");

//     const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
//     res.setHeader("Content-Disposition", "attachment; filename=events.xlsx");
//     res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
//     res.send(excelBuffer);
//   } catch (err) {
//     console.error("Ошибка при экспорте событий:", err);
//     res.status(500).json({ message: "Ошибка при экспорте событий." });
//   }
// });

// // Завершение работы с базой данных при остановке сервера
// process.on("SIGINT", async () => {
//   await client.close();
//   console.log("Подключение к MongoDB закрыто");
//   process.exit(0);
// });

// // Запуск сервера
// app.listen(PORT, () => {
//   console.log(`Сервер запущен на http://localhost:${PORT}`);
// });


const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const xlsx = require("xlsx");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// Подключение к SQLite
const db = new sqlite3.Database("./events.db", (err) => {
  if (err) {
    console.error("Ошибка подключения к базе данных:", err.message);
    process.exit(1);
  }
  console.log("Успешное подключение к SQLite");
});

// Создание таблицы при первом запуске
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      studentid TEXT NOT NULL,
      date TEXT NOT NULL,
      startTime TEXT NOT NULL,
      endTime TEXT NOT NULL,
      comment TEXT,
      selectedOption TEXT NOT NULL
    )`
  );
});

// Простая аутентификация администратора
const adminCredentials = {
  username: "polito@admin",
  password: "Turin@2024admin",
};

// Проверка прав администратора
const isAdmin = (req, res, next) => {
  const { username, password } = req.body;
  if (
    username === adminCredentials.username &&
    password === adminCredentials.password
  ) {
    next();
  } else {
    return res.status(403).json({ message: "Доступ запрещен. Необходимы права администратора." });
  }
};

// Логин администратора
app.post("/admin/login", (req, res) => {
  const { username, password } = req.body;
  if (
    username === adminCredentials.username &&
    password === adminCredentials.password
  ) {
    return res.json({ message: "Успешный вход в админ-панель" });
  } else {
    return res.status(403).json({ message: "Неверные учетные данные" });
  }
});

// Добавление события
app.post("/events", (req, res) => {
  const { name, studentid, date, startTime, endTime, comment, selectedOption } = req.body;

  if (!name || !studentid || !date || !startTime || !endTime || !selectedOption) {
    return res.status(400).json({ message: "Все поля обязательны для заполнения." });
  }

  const query = `INSERT INTO events (name, studentid, date, startTime, endTime, comment, selectedOption)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  db.run(query, [name, studentid, date, startTime, endTime, comment, selectedOption], function (err) {
    if (err) {
      console.error("Ошибка при добавлении события:", err.message);
      return res.status(500).json({ message: "Ошибка при добавлении события." });
    }
    res.status(201).json({ id: this.lastID, name, studentid, date, startTime, endTime, comment, selectedOption });
  });
});

// Получение всех событий
app.get("/events", (req, res) => {
  const query = "SELECT * FROM events";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Ошибка при получении событий:", err.message);
      return res.status(500).json({ message: "Ошибка при получении событий." });
    }
    res.json(rows);
  });
});

// Обновление события
app.put("/events/:id", (req, res) => {
  const { id } = req.params;
  const { name, studentid, date, startTime, endTime, comment, selectedOption } = req.body;

  const query = `UPDATE events SET name = ?, studentid = ?, date = ?, startTime = ?, endTime = ?, comment = ?, selectedOption = ?
                 WHERE id = ?`;
  db.run(query, [name, studentid, date, startTime, endTime, comment, selectedOption, id], function (err) {
    if (err) {
      console.error("Ошибка при обновлении события:", err.message);
      return res.status(500).json({ message: "Ошибка при обновлении события." });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Событие не найдено." });
    }
    res.json({ id, name, studentid, date, startTime, endTime, comment, selectedOption });
  });
});

// Удаление события
app.delete("/events/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM events WHERE id = ?";
  db.run(query, id, function (err) {
    if (err) {
      console.error("Ошибка при удалении события:", err.message);
      return res.status(500).json({ message: "Ошибка при удалении события." });
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Событие не найдено." });
    }
    res.status(204).send();
  });
});

// Экспорт событий в Excel
app.get("/export", (req, res) => {
  const query = "SELECT * FROM events";
  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Ошибка при экспорте событий:", err.message);
      return res.status(500).json({ message: "Ошибка при экспорте событий." });
    }
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, "Events");

    const excelBuffer = xlsx.write(workbook, { bookType: "xlsx", type: "buffer" });
    res.setHeader("Content-Disposition", "attachment; filename=events.xlsx");
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(excelBuffer);
  });
});

// Закрытие подключения при остановке сервера
process.on("SIGINT", () => {
  db.close((err) => {
    if (err) {
      console.error("Ошибка при закрытии базы данных:", err.message);
    }
    console.log("Соединение с SQLite закрыто");
    process.exit(0);
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
