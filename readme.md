# NodeJS - The Complete Guide

This is the codebase as I worked through the [Node.js - The Complete Guide](https://www.udemy.com/course/nodejs-the-complete-guide) course on Udemy.

See my blog for [my review of the course](https://www.brentkeller.com/blog/nodejs-complete-course-review)

The course worked through various things including different data storage stacks. I did each of the different stacks in a separate branch so they would be easily accessible for reference later. Here's a quick reference of what each branch is:

| Branch    | Description                                                                         |
| --------- | ----------------------------------------------------------------------------------- |
| master    | Main working branch with final `express-mvc` and `express-rest` projects            |
| sequelize | `express-mvc` project: using `sequelize` to connect to local MS SQL Server database |
| mongodb   | `express-mvc` project: using `mongodb` to connect to local MongoDB server           |
| mongoose  | `express-mvc` project: using `mongoose` to connect to local MongoDB server          |
| socket-io | `express-mvc` project: using `socket.io` to add client sync features                |
| graphql   | `express-rest` project: convert REST API to use `GraphQL`                           |

## Useful Packages

Here are some of the useful packages that were covered in the course.

### Express

- [express](https://www.npmjs.com/package/express): Fast, unopinionated, minimalist web framework for node
- [body-parser](https://www.npmjs.com/package/body-parser): A body parsing middleware
- [connect-flash](https://www.npmjs.com/package/connect-flash): Store temporary messages in an express session, useful for validation messages in MVC apps
- [csurf](https://www.npmjs.com/package/csurf): A CSRF (cross-site request forgery) protection middleware
- [express-validator](https://www.npmjs.com/package/express-validator): Provides easy, flexible [validation middlewares](https://express-validator.github.io/docs/) uses [validator.js](https://github.com/validatorjs/validator.js) under the hood
- [multer](https://www.npmjs.com/package/multer): A middleware for `multipart/form-data` to make it easy to handle uploads
- [helmet](https://www.npmjs.com/package/helmet): Middleware to automatically add secure response headers to help secure your app
- [compression](https://www.npmjs.com/package/compression): Middleware to compress responses
- [morgan](https://www.npmjs.com/package/morgan): A request logging middleware

### General

- [bcryptjs](https://www.npmjs.com/package/bcryptjs): A javascript implementation of `bcrypt` to provide simple hashing for passwords and other data
- [pdfkit](http://pdfkit.org/): Create PDF documents in javascript
- [socket.io](https://www.npmjs.com/package/socket.io): Simple web sockets library. Also has a [client library](https://github.com/socketio/socket.io-client). Example in `socket-io` branch

### Mongo

- [connect-mongodb-session](https://www.npmjs.com/package/connect-mongodb-session): Store express sessions in MongoDB
- [mongodb](https://www.npmjs.com/package/mongodb): The official MongoDB driver for node
- [mongoose](https://www.npmjs.com/package/mongoose): A MongoDB object modeling tool

### SQL

- [sequelize](https://www.npmjs.com/package/sequelize): An ORM for connecting to SQL servers
- [tedious](https://www.npmjs.com/package/tedious): A driver for connecting to MS SQL Server, can be used by sequelize

### Email

- [nodemailer](https://www.npmjs.com/package/nodemailer): Enables easy sending of emails from node
- [nodemailer-sendgrid-transport](https://www.npmjs.com/package/nodemailer-sendgrid-transport): A nodemailer plugin to send mails via [sendgrid](https://sendgrid.com/)

### GraphQL

- [graphql](https://www.npmjs.com/package/graphql): Javascript implementation of GraphQL
- [express-graphql](https://www.npmjs.com/package/express-graphql): An express middleware GraphQL HTTP server
