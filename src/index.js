const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

/**
 * cpf - string
 * name - string
 * id - uuid - universal unique identifier
 * statement - array
 */
app.post('/account', (req, res) => {
    const { cpf, name } = req.body;
    const id = uuidv4();
    customers.push({
        cpf,
        name,
        id,
        statement: []
    });

    return res.status(201).send();
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
