const express = require('express');
require ('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index.ejs');
});

app.post('/checkout', async (req, res) => { 
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
        {
            price_data: {
            currency: 'usd',
            product_data: {
                name: 'Node.js and Express Book',  
            },
            unit_amount: 50 * 100, // 50 dollars in cents
            },
            quantity: 1,
        },
        {
            price_data: {
            currency: 'usd',
            product_data: {
                name: 'JavaScript T-Shirt',  
            },
            unit_amount: 20 * 100, // 20 dollars in cents
            },
            quantity: 2,
        },
        ],
        mode: 'payment',
        shipping_address_collection: {
            allowed_countries: ['US', 'CA', 'GB', 'NG'],
        },
        success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel`
    });
    
    res.redirect(303, session.url);

    });
app.get('/success', async (req, res) => {
    const result = Promise.all([
        stripe.checkout.sessions.retrieve(req.query.session_id),
        stripe.checkout.sessions.listLineItems(req.query.session_id)
    ]);
    
    console.log(JSON.stringify (await result));
    res.send('Your payment was successful');
});

app.get('/cancel', (req, res) => {
    res.redirect('/')
});
    app.listen(3000, () => {
  console.log('Server is running on port 3000');
});