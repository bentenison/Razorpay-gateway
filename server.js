const express = require("express");
const cors = require("cors");
const path = require('path')
const shortid = require('shortid')
const app = express();
const Razorpay = require("razorpay");
//const bodyParser = require('body-parser')
app.use(cors());
require("dotenv").config();
//app.use(bodyParser.json())
app.use(express.json());
const razorpay = new Razorpay({
  key_id: process.env.RAZOR_PAY_KEY_ID,
  key_secret: process.env.RAZOR_PAY_KEY_SECRET,
});

app.get('/logo.svg', (req, res) => {
	res.sendFile(path.join(__dirname, 'logoeccc.svg'))
})

app.post('/verification', (req, res) => {
	// do a validation
	const secret = '12345678'

	console.log(req.body)

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		require('fs').writeFileSync('payment1.json', JSON.stringify(req.body, null, 4))
	} else {
		// pass it
	}
	res.json({ status: 'ok' })
})

app.post('/razorpay', async (req, res) => {
	const {amount} = req.body
	console.log(amount)
	const payment_capture = 1
	//const amount = 499
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("Server is listening at http://localhost:5000");
});
