const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const customersData = require('./Customer.json');

app.use(bodyParser.json());

app.get('/customers', (req, res) => {
    const { page = 1, limit = 10, first_name, last_name, city } = req.query;

    let customerList = customersData
    if (first_name) {
        customerList = customerList.filter(customer => {
            customer.first_name.toLowerCase().includes(first_name.toLowerCase())
        })
    }
    if (last_name) {
        customerList = customerList.filter(customer => {
            customer.last_name.toLowerCase().includes(last_name.toLowerCase())
        })
    }
    if (city) {
        customerList = customerList.filter(customer => {
            customer.city.toLowerCase().includes(city.toLowerCase())
        })
    }

    const pageStart = (page - 1) * limit;
    const pageEnd = page * limit;
    const paginatedCustomers = customerList.slice(pageStart, pageEnd);

    res.json({ customerList: paginatedCustomers })
});

app.get('/customers/:id', (req, res) => {

    const customerId = parseInt(req.params.id);
    const customer = customersData.find(customer => customer.id === customerId);
    if (customer) {
        res.json({ customer: customer })
    } else {
        res.status(404).json({ error: "Customer Not Found" })
    }
});

app.get('/cities', (req, res) => {
    const cityCustomerCounts = {};
    customersData.forEach(customer => {
        const city = customer.city.toLowerCase();
        if (cityCustomerCounts[city]) {
            cityCustomerCounts[city]++
        } else {
            cityCustomerCounts[city] = 1
        }
    })
    res.json(cityCustomerCounts);
});

app.post('/customers/add', (req, res) => {
    const { id, first_name, last_name, city, company } = req.body;

    if (!id || !first_name || !last_name || !city || !company) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const existingCustomer = customersData.find(customer => customer.id === id);
    if (!existingCustomer) {
        return res.status(404).json({ message: 'Customer not found' });
    }
    if (existingCustomer.city !== city || existingCustomer.company !== company) {
        return res.status(400).json({ message: 'City or company does not match existing customer' });
    }
    const newCustomer = {
        id,
        first_name,
        last_name,
        city,
        company
    };
    customersData.push(newCustomer);

    res.status(200).json(newCustomer);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
