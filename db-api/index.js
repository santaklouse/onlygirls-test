const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

const {DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE} = process.env;

const db = mysql.createConnection({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

app.use(express.json());

// Endpoint для получения моделей
app.get('/models', (req, res) => {

    /*
        SELECT *, likes.count as likes
        FROM of_users
        RIGHT JOIN (
            SELECT
                model_id as id,
                count(*) as count
            FROM model_swipes
            WHERE `like` = TRUE
            GROUP BY model_id
            HAVING count > 1000
        ) likes ON of_users.id = likes.id
        ORDER BY RAND()
        LIMIT 10
     */

    const sql = `
        WITH UserLikes AS (
            SELECT distinct models.id,
               ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
            FROM of_users models
            RIGHT JOIN (SELECT model_id as id, count(\`like\`) as count
                        FROM model_swipes
                        GROUP BY model_id
                        HAVING count > 1000) likes ON models.id = likes.id
        ),
        TotalRand10 as (
            SELECT id, rn FROM UserLikes
            UNION ALL
            SELECT id, ROW_NUMBER() OVER (ORDER BY RAND()) AS rn
            FROM of_users
            WHERE id NOT IN (SELECT id FROM UserLikes)
            ORDER BY rn
            LIMIT 10
        )
        SELECT * from of_users where id in (SELECT id from TotalRand10)
    `;

    db.query(sql, (err, result) => {
        if (err) throw err;
        res.json(result);
    });
});

// Endpoint для записи свайпов
app.post('/swipe', (req, res) => {
    const { model_id, like, ip, date } = req.body;
    const sql = 'INSERT INTO model_swipes (model_id, `like`, ip) VALUES (?, ?, ?)';
    db.query(sql, [model_id, like, ip], (err, result) => {
        if (err) throw err;
        res.send('OK');
    });
});

app.listen(port, () => {
    console.log(`API running on http://localhost:${port}`);
});
