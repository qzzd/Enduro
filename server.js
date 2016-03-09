
// * ———————————————————————————————————————————————————————— * //
// * 	Server
// *	Runs production server with password protection and
// *	admin ui and better routing
// * ———————————————————————————————————————————————————————— * //

var express = require('express')
var app = express()
var admin_api = require('./libs/admin_api')
var website_api = require('./libs/website_api')
var kiska_guard = require('./libs/kiska_guard')
var session = require('express-session')

// Initialization of the sessions
app.set('trust proxy', 1)
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}))

var EnduroServer = function () {}

EnduroServer.prototype.run = function () {

	// stores current enduroServer instance
	var enduroServer = this;

	// 5000 or server's port
	app.set('port', (process.env.PORT || 5000))

	// Serve static files from /_src folder
	app.use('/assets', express.static(cmd_folder + '/_src/assets'))
	app.use('/admin', express.static(cmd_folder + '/_src/admin'))

	// Handle for executing enduro refresh from client
	app.get('/admin_api_refresh', function (req, res) {
		enduroServer.enduroRefresh(function(){
			res.send({success: true, message: 'enduro refreshed successfully'})
		})
	});

	// Handle for all admin api calls
	app.get('/admin_api/*', function (req, res) {
		admin_api.call(req, res);
	});

	// Handle for all website api calls
	app.get('/api/*', function (req, res) {
		website_api.call(req, res);
	});

	// Handle for all website api calls
	// TODO quick fixed, kinda works but doesnt make any sense
	app.get('/*', function (req, res) {
		console.log(req.query['pswrd'])
		if(req.query['pswrd']){
			kiska_guard.login(req)
				.then(() => {
					var htmlFile = req.url.length > 1 ? req.url : '/index'
					res.sendFile(cmd_folder + '/_src' + htmlFile + '.html')
				}, () => {
					res.sendFile(cmd_folder + '/_src/enduro_login.html')
				})
		}
		else{
			kiska_guard.login(req)
				.then(() => {
					var htmlFile = req.url.length > 1 ? req.url : '/index'
					res.sendFile(cmd_folder + '/_src' + htmlFile + '.html')
				}, () => {
					//res.redirect('/enduro_login')
					res.sendFile(cmd_folder + '/_src/enduro_login.html')
				})
		}
	});

	app.listen(app.get('port'), function () {
		enduroServer.enduroRefresh(() => {})
	});

}

// Sets enduroRefresh function from parent
EnduroServer.prototype.setRefresh = function (callback) {
	EnduroServer.prototype.enduroRefresh = callback;
}

// Placehodler refresh function - This function is being replaced by parent
EnduroServer.prototype.enduroRefresh = function () {
	console.log('refresh not defined')
}

module.exports = new EnduroServer()