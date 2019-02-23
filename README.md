This Repository contains node.js apis for shopping app. It uses mongodb client as backend.

1) It lets users signup, login and change the password of their account.
2) Admin has the right to delete users, get users list, manage password reseting, get products list and orders lists.
3) Authenticated users can create products with uploading images and delete products.
4) Authenticated users can create orders and delete orders.

Note:
1) Replace your email and password in config.js to send "reset password" email link to users.
2) Replace your mongoose client url in app.js to connect to the database.
