"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const nunjucks_1 = __importDefault(require("nunjucks"));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../db.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Stripe = require('stripe');
const domainRoot = (_a = process.env.DOMAIN_ROOT) !== null && _a !== void 0 ? _a : 'http://localhost:3000';
const app = (0, express_1.default)();
const stripe = Stripe('sk_test_51LHShpGP9mrjBLL1eEwI10bh9nxRh4ySUJO2TLJ1fsLoJfZJCff3xf3mHA7expvCqNwubDH1oQfkRxSAqhzaLOsb00k415ICdi');
nunjucks_1.default.configure('views', {
    autoescape: true,
    express: app,
    noCache: true,
});
app.use(express_1.default.static('public'));
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
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
app.listen((_b = process.env.PORT) !== null && _b !== void 0 ? _b : 3000);
//# sourceMappingURL=server.js.map