const { request } = require('express');
const express = require('express');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(express.json());

const customers = [];

// Middleware
function verifyIfExistsAccountCPF(req, res, next) {
    const { cpf } = req.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return res.status(400).json({ error: 'Customer not found!' });
    }

    // add customer to request, so we can use inside the next request/route
    request.customer = customer;

    return next();
}

/**
 * cpf - string
 * name - string
 * id - uuid - universal unique identifier
 * statement - array
 */
app.post('/account', (req, res) => {
    const { cpf, name } = req.body;

    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
    );
    if (customerAlreadyExists) {
        return res.status(400).json({ error: 'Customer already exists!' });
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return res.status(201).send();
});

// app.use(verifyIfExistsAccountCPF);
// every that comes after this line will be affected by the middleware
app.get('/statement', verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;
    return res.json(customer.statement);
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
