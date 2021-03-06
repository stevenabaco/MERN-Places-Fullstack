// Import Modules packages
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
// Import dependencies
const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');
// Instantiate express
const app = express();
// Configure middleware

app.use(express.json());

app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(express.static(path.join('public'))); // Only need this for same server setup

//CORS HEADERS -- ONLY NEED IF BACKEND SERVED ON SEPERATE SERVER
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
	next();
});

app.use('/api/places', placesRoutes); // => /api/places...
app.use('/api/users', usersRoutes); // => /api/users...

// Code for single server hosting only where Frontend is put in publid folder
app.use((req, res, next) => {
	res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Code to handle errors only if back end is seperated from frontend
// app.use((req, res, next) => {
// 	const error = new HttpError('Could not find this route.', 404);
// 	throw error;
// });

app.use((error, req, res, next) => {
	// Middleware to handle errors
	if (req.file) {
		// Do not allow files to be uploaded if errors exist
		fs.unlink(req.file.path, err => {
			console.log(err);
		});
	}
	if (res.headerSent) {
		return next(error);
	}
	res.status(error.code || 500);
	res.json({ message: error.message || 'An unknown error occured!' });
});

mongoose
	.connect(
		`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m9rfm.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
		{
			useNewUrlParser: true,
			useUnifiedTopology: true,
			useFindAndModify: false,
			useCreateIndex: true,
		}
	)
	.then(() => {
		app.listen(process.env.PORT || 5000);
	})
	.catch(err => {
		console.log(err);
	});
