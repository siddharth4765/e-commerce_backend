const express = require("express")
const app = express()
const port = 3000
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const bodyParser = require("body-parser")
const LocalStrategy = require("passport-local").Strategy
const productSchema = {
	name: String,
	price: String,
	quantity: Number,
	seller_id: mongoose.Types.ObjectId,
	seller_location: Object
}
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
})
const transactionSchema = {
	buyer_id: mongoose.Types.ObjectId,
	seller_id: mongoose.Types.ObjectId,
	amount_sold: Number,
	prod_id: mongoose.Types.ObjectId,
	buyer_location: String,
	seller_location: String
}

app.use(bodyParser.urlencoded({extended: true}))
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}))
app.use(passport.initialize());
app.use(passport.session());
userSchema.plugin(passportLocalMongoose)

mongoose.connect("mongodb://localhost:27017/Algo8_AI__ecom", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true)
const Product = mongoose.model("Product", productSchema)
const Transaction = mongoose.model("Transaction", transactionSchema)
const User = mongoose.model("User", userSchema)

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
 
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {

	Product.find(function(err, foundProducts){
    if (!err) {
      res.render("home", {products: foundProducts})
    } else {
      res.send(err)
    }
  })

})

app.get("/products/:productId", (req, res) => { //to do

	const id = req.params.productId
	Product.findById(id, function(err, foundProduct){
		if (!err) {
			res.render("product", {product: foundProduct})
		} else {
			res.send(err)
		}
	})

})

app.get("/login", (req, res) => {
	res.render("login")
})

app.get("/register", (req, res) => {
	res.render("register")
})

app.post("/register", (req, res) => {
 
	User.register(new User({username: req.body.username}), req.body.password, function(err, user) {
  		if (err) {
  			console.log(err)
  			res.redirect("/register")
  		} else {
  			passport.authenticate('local')(req, res, function () {
          	res.redirect("/dashboard")
        	})
  		}
  	})

})

app.get("/dashboard", async (req, res) => {

	const currentUser = req.user
	let buy_products = []
	let sell_products = []

	if (req.isAuthenticated()) {

		const buy_transactions = await Transaction.find({buyer_id: currentUser._id})
		let len = buy_transactions.length
		const fill_buy_products = () => {
			const promise = new Promise(async (resolve, reject) => {
				buy_transactions.forEach(async function(transaction) {
					const product = await Product.findOne({_id: transaction.prod_id})
					if (product) {
						buy_products.push(product)
					}
					if (transaction == buy_transactions[len-1]) {resolve(buy_products)}
				})				
			})
			return promise
		}
		buy_products = await fill_buy_products()
		
		const sell_transactions = await Transaction.find({seller_id: currentUser._id})
		len = sell_transactions.length
		const fill_sell_products = () => {
			const promise = new Promise(async (resolve, reject) => {
				sell_transactions.forEach(async function(transaction) {
					const product = await Product.findOne({_id: transaction.prod_id})
					if (product) {
						sell_products.push(product)
					}
					if (transaction == sell_transactions[len-1]) {resolve(sell_products)}
				})				
			})
			return promise
		}
		sell_products = await fill_sell_products()
		
		res.render("dashboard", {buy_products: buy_products, sell_products: sell_products, user: currentUser})

		}
	else {
		res.redirect("/login")
	}

})

app.get("/logout", (req, res) => {

	req.logout()
	res.redirect("/")

})

app.post("/checkout", (req, res) => {

	Product.find({_id: req.body.prod_id, seller_id: req.body.seller_id}, (err, product) => {
		product = product[0]
		let quantity_in_store = product.quantity
		if(req.isAuthenticated()) {
			if (req.body.quantity > quantity_in_store) {
				res.send("not enough stock")
			}
			const transaction = new Transaction({
				buyer_id: req.user._id,
				seller_id: req.body.seller_id,
				amount_sold: req.body.quantity,
				prod_id: req.body.prod_id,
				buyer_location: req.body.buyer_location,
				seller_location: req.body.seller_location
				})
			transaction.save()

			quantity_in_store -= req.body.quantity
			Product.updateOne({_id: req.body.prod_id, seller_id: req.body.seller_id}, {quantity: quantity_in_store}, (err, o) => {})
			res.render("checkout")
		
		} else {
			res.redirect("/login")
		}
	})
	

})


app.post("/login", (req, res) => {

	const user = new User({
		username: req.body.username,
		password: req.body.password
	})

	req.login(user, function(err) {
  		if (err) { 
  			res.redirect("/login")
  		} else {
  			passport.authenticate("local")(req, res, function () {
          	res.redirect("/dashboard");
        });
  		}
	})
})

app.post("/addProduct", (req, res) => {

	const product = new Product({
		name: req.body.prodName,
		price: req.body.prodPrice,
		quantity: parseInt(req.body.prodAmt),
		seller_id: req.body.user_id,
		seller_location: req.body.seller_location
	})

	product.save()
	res.redirect("/dashboard")
})


app.listen(port, () => {
  console.log(`Algo8.AI internship assignment app listening at http://localhost:${port}`)
})