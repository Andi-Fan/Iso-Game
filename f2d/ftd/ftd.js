/* 
 * What about serving up static content, kind of like apache? 
 * This time, you are required to present a user and password to the login route
 * before you can read any static content.
 */

var process = require('process');
// run ftd.js as 

// nodejs ftd.js PORT_NUMBER
var port = parseInt(process.argv[2]); 
var express = require('express');
var cookieParser = require('cookie-parser')
const sqlite3 = require('sqlite3').verbose();
var bodyParser = require('body-parser');
var bcrypt = require('bcryptjs');

var app = express();
app.use(cookieParser()); // parse cookies before processing other middleware
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

// ----------------------------------------------------------------------------------
// BEGIN: To restrict access to / 
// ----------------------------------------------------------------------------------
var id = Math.random().toString(36).substring(2, 15) + 
Math.random().toString(36).substring(2, 15);

let dbAccounts = new sqlite3.Database('./db/Accounts.db', (err) => {
	if (err) {
		console.error(err.message);
	} else {
		console.log('Connected to the chinook database.');
	}
});



app.get('/login/:user/password/:password', function (req, res) {
	dbAccounts.serialize(() => {
		query = dbAccounts.prepare('SELECT * FROM Account WHERE username=?'); 
		query.get(req.params.user, (err, row) => {
			let result = bcrypt.compareSync(req.params.password, row.password) 
			if (err) {
				console.error(err);
				res.send({statusCode: 500});
			}
			if(result) {
				res.cookie("id", id);
				res.send({statlogin: "loggedIn", data: row, statusCode: 200});
			} else {
				res.send({statlogin: "loggedFailed", name: req.params.user, statusCode: 401});
			}

		});
	})
});

app.get('/menu/stats/login/:user', function(req, res){
	dbAccounts.serialize(() => {
		//retrieves user info
		query = dbAccounts.prepare('SELECT Total_kills FROM stats WHERE username=?'); 
		query.get(req.params.user, (err, row) => {
			if (err) {
				res.send({statusCode: 500});
			} 
			else{
				if (row.Total_kills){
					res.send({totalkills: row.Total_kills, statusCode:200});
				}
				else {
					res.send({totalkills: 0, statusCode: 200});
				}
			}
			
		});
	})
});


app.get('/menu/stats/leaderboards', function(req, res){
	dbAccounts.serialize(() => {
		//retrieves leaderboard info for the top 10 players
		query = dbAccounts.prepare('SELECT s.* FROM stats s ORDER BY s.Total_kills DESC LIMIT 10'); 
		query.all((err, row) => {
			if (err) {
				res.send({statusCode: 500});
				console.error(err);
			} else if (row) {
				res.send({ln: row, statusCode:200});
			} else {
				res.send({statusCode: 404});
			}
			
		});
	})
});

app.put('/menu/Profile/changecolor', function(req, res){
	dbAccounts.serialize(() => {
		var err = 0;
		query = dbAccounts.prepare('UPDATE Account SET headcolor=? WHERE username=?'); 
		query.run(req.body.headcolor, req.body.user, (err) => {
			if (err) {
				res.send({Updatestat:'fail', statusCode: 500});
				return;
			}
		});
		query.finalize();
	})

	dbAccounts.serialize(() => {
		query = dbAccounts.prepare('UPDATE Account SET bodycolor=? WHERE username=?'); 
		query.run(req.body.bodycolor, req.body.user, (err) => {
			if (err) {
				res.send({Updatestat:'fail', statusCode: 500});
				return; 
			}
			else {
				res.send({Updatestat:'success', statusCode: 200});
			}
		});
		query.finalize();
	})
});

app.put('/menu/Profile/changepass', function(req, res){
	dbAccounts.serialize(() => {
		query = dbAccounts.prepare('UPDATE Account SET password=? WHERE username=?'); 
		query.run(req.body.password, req.body.user, (err) => {
			if (!err) {
				res.send({Updatestat:'success', statusCode: 200});
				return; 
			}
			else {
				res.send({Updatestat:'fail', statusCode: 500});
			}
		});
		query.finalize();
	})
});

app.put('/menu/Profile/delete', function(req, res){
	dbAccounts.serialize(() => {
		query = dbAccounts.prepare('DELETE FROM Account WHERE username=?'); 
		query.run(req.body.user, (err) => {
			if (!err) {
				res.send({Deletestat:'success', statusCode: 200});
				return; 
			}
			else {
				res.send({Updatestat:'fail', statusCode: 500});
			}
			
		}); 
		query.finalize();
	})
});

app.put('/menu/stats/update/', function (req, res) {
	try {
		query = dbAccounts.prepare('UPDATE stats SET Total_kills = Total_kills + ? WHERE username = ?;'); 
		query.run(req.body.Total_kills, req.body.username, (err) => {
			if (!err){
				res.send({msg: 'success', statusCode: 201});
			}
		})
		query.finalize();
	} catch (err) {
		console.error(err)
	}
});

app.post('/register', function (req, res) {
	try {
		dbAccounts.serialize( async function () {	
			var salt = bcrypt.genSaltSync(10);
			var hashedPassword = await bcrypt.hashSync(req.body.password, salt);
			query = dbAccounts.prepare('INSERT INTO Account (username, password, headcolor, bodycolor) Values(?, ?, "#ff1000", "#ff1000");'); 

			query.run([req.body.user, hashedPassword], (err) => {
				if (err !== null && err.message.includes('SQLITE_CONSTRAINT')) {
					res.send({regstat: "taken_username", statusCode: 500});
				}
				else if (err){
					res.send({regstat: "server_error", statusCode: 500});
				}
			});
			query.finalize(); 	
			
			//set new user's Total_kills to 0
			dbAccounts.serialize(() => {		
				//set new user's Total_kills to 0
				query = dbAccounts.prepare('INSERT INTO stats (username, Total_kills) Values(?, 0);'); 
				query.run(req.body.user, (err) => {
					if (!err){
						res.send({regstat: 'success', statusCode: 201});
					}
				})
				query.finalize();
			});
		});
		
	} catch (err) {
		console.err(err)
	}
});


// This is a checkpoint before allowing access to /zzs
app.use('/', function (req, res, next) {
	next();
});
// ----------------------------------------------------------------------------------
// END: To restrict access to /
// ----------------------------------------------------------------------------------

app.use('/', express.static('static_files')); // this directory has files to be returned

app.listen(port, function () {
  console.log('Example app listening on port '+port);
});
