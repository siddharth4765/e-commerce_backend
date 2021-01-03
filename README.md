# e-commerce_backend

This is the backend for my e-commerce web store app which is implemented using:
1. Node.js and Express.js
2. Passport.js for authentication using a local strategy
3. MongoDB and Mongoose for user and products database
4. Stripe for payment
5. EJS for dynamic rendering of web pages
6. HTML Geolocation API

The functionality is as follows:
1. The main server file is the server.js Node.js file which listens at http://localhost:3000
2. The root route is the home page where all products are displayed. The page for a product can be visited by clicking on the 'Go to product page' button next to the product name.
3. The /login route and the /register routes are for login and registering a new user.
4. On login, the dashboard page appears where the user's buying and selling history is visible.
5. The user can add products for sale by using the form on the dashboard page.
6. Basic buying and selling functionality is there and a product can be bought by visiting its page.
7. Buyer and seller locations are stored in the database.
8. Valid coupon codes can be used to apply discount.