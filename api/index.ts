import 'source-map-support/register';
import 'reflect-metadata';

import bodyParser from 'body-parser';
import express from 'express';
import nunjucks from 'nunjucks';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../db.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');
const domainRoot = process.env.DOMAIN_ROOT ?? 'http://localhost:3000';
const app = express();
const stripe = Stripe(
  'sk_test_51LHShpGP9mrjBLL1eEwI10bh9nxRh4ySUJO2TLJ1fsLoJfZJCff3xf3mHA7expvCqNwubDH1oQfkRxSAqhzaLOsb00k415ICdi',
);

nunjucks.configure('views', {
  autoescape: true,
  express: app,
  noCache: true,
});
app.use(express.static('public'));
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.get('/', function (req, res) {
  res.render('index.html', { items: db.items });
});

app.get('/items/:id', (req, res) => {
  const orderQuantity = req.query.orderQuantity || 0;
  const cancelled = req.query.cancelled || false;
  const item = db.items.find((item) => item.id === parseInt(req.params.id));
  res.render('single-item.html', { item: item, orderQuantity: orderQuantity, cancelled: cancelled });
});

app.post('/buy/items/', async (req, res) => {
  const item = db.items.find((item) => item.id === parseInt(req.body.id));
  const orderQuantity = parseInt(req.body.quantity);

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            description: item.description,
            images: [`${domainRoot}${item.picture}`],
          },
          unit_amount: item.price,
        },
        quantity: orderQuantity,
      },
    ],
    mode: 'payment',
    success_url: `${domainRoot}/items/${item.id}?orderQuantity=${orderQuantity}`,
    cancel_url: `${domainRoot}/items/${item.id}?cancelled=true`,
  });

  res.redirect(303, session.url);
});

app.get('/buy/success/', (req, res) => {
  res.send('You have successfully bought your products.');
});

app.listen(process.env.PORT ?? 3000);
