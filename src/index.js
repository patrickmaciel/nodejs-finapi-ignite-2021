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

function getBalance(statement) {
    return statement.reduce((acumulador, objetoOperacao) => {
        if (objetoOperacao.type === 'credit') {
            return acumulador + objetoOperacao.amount;
        }
        return acumulador - objetoOperacao.amount;
    }, 0);
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

app.get('/statement/date', verifyIfExistsAccountCPF, (req, res) => {
    const { customer } = req;
    const { date } = req.query;

    const dateFormat = new Date(date + " 00:00");
    const statement = customer.statement.filter((statement) =>
        statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return res.json(customer.statement);
});

app.post('/deposit', verifyIfExistsAccountCPF, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date,
        type: "credit"
    };
    customer.statement.push(statementOperation);

    return response.status(201).send();

});

app.post('/withdraw', verifyIfExistsAccountCPF, (request, response) => {
   const { amount } = request.body;
   const { customer } = request;

   const balance = getBalance(customer.statement);
   console.log({ balance, amount });
   if (balance < amount) {
       return response.status(400).json({ error: 'Insufficient funds!' });
   }

   const statementOperation = {
         amount,
        created_at: new Date,
        type: "debit"
    };

   customer.statement.push(statementOperation);
   return response.status(201).send();

});

app.put('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();
});

app.get('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;
    return response.json(customer);
});

app.delete('/account', verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    // splice
    customers.splice(customer, 1);

    return response.status(200).json(customers);
});

app.get('/balance', verifyIfExistsAccountCPF, (request, response) => {
   const { customer } = request;
   const balance = getBalance(customer.statement);
   return response.json({ balance: balance });
});

app.listen(3000, () => {
    console.log('Server started on port 3000');
});
