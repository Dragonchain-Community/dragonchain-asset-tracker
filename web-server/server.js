const util = require('util');
const dcsdk = require('dragonchain-sdk')
const express = require('express');
const exphbs = require('express-handlebars');

const helper = require('asset-tracker-helper');

const app = express();

const main = async() => {
	
	var hbs = exphbs.create({
		helpers: {
			json: function (context) {return JSON.stringify(context);},
			jsonPretty: function (context) {return JSON.stringify(context, null, 2);}			
		}
	})

	app.engine('handlebars', hbs.engine);
	app.set('view engine', 'handlebars');

	app.use(express.urlencoded({ extended: true }))
	app.use('/public',  express.static(__dirname + '/public'));		
	app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist/'));		

	app.get('/', (req, res) => {
		res.render('index', {title: "Dragonchain Asset Tracker"});
	});	

    app.use(function (err, req, res, next) {
        console.log(err);

        res.render('error', {
            title: "Error - Dragonchain Asset Tracker",
            error: err
        });
    });

	// In production (optionally) use port 80 or, if SSL available, use port 443 //
	const server = app.listen(3005, '127.0.0.1', () => {
		console.log(`Express running → PORT ${server.address().port}`);
	});
}


main().then().catch(console.error)


