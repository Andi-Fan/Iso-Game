var stage;
var view;
var interval;
var keyIsPressed = {
	'a': false,
	's': false,
	'd': false,
	'w': false
}
var isMouseDown;
var isPickingUp;
var toggleBuildMode;

function setupGame(){
	stage=null;
	view = null;
	interval=null;
	isMouseDown;
	isPickingUp = false;  
	toggleBuildMode = false; 
	stage=new Stage(document.getElementById('stage'), bodycolor. headcolor);

	// https://javascript.info/keyboard-events
	document.addEventListener('keydown', keyEvents);
	document.addEventListener('keyup', keyEvents);
	document.addEventListener('mousedown', mouseDown);
	document.addEventListener('mouseup', mouseUp);
	document.addEventListener('mousemove', mouseMouse);
	document.addEventListener('onresize', resize_canvas);
}
function resize_canvas() {
	canvas = document.getElementById("stage");
	if (canvas.width < window.innerWidth) { 
		stage.width = window.innerWidth * stage.mapScale; 
		canvas.width = window.innerWidth;
	}
	if (canvas.height < window.innerHeight) { 
		stage.height = window.innerHeight * stage.mapScale; 
		canvas.height = window.innerHeight; 
	}
}
function startGame(){
	interval=setInterval(function(){ stage.step(); stage.draw();isGameOver(); }, 20);
}
function pauseGame(){
	clearInterval(interval);
	interval=null;
}
function isGameOver(){
	let uploadStats = false; 
	if (this.stage.numOfEnemies === 0) {
		pauseGame();
		$("#game_status").html("You Win!")
		$("#game_results").html(`You got a total of ${this.stage.player.enemiesKilled} kills in ${this.stage.player.timeSurvived} seconds`)
		$("#Game_Finished").show()
		uploadStats = true; 
	} else if (this.stage.gameOver) {
		pauseGame();
		$("#game_status").html("You Lose!")
		$("#game_results").html(`You got a total of ${this.stage.player.enemiesKilled} kills in ${this.stage.player.timeSurvived} seconds`)
		$("#Game_Finished").show()
		uploadStats = true; 
	} 

	if (uploadStats) {
		$.ajax({
			url: '/menu/stats/update',
			type: 'PUT',
			data: {
			  username: client_username,
			  Total_kills: this.stage.player.enemiesKilled,
			  Time_taken: this.stage.player.timeSurvived,
			}
		  }).done((data) => {
			$("#game_results").append("</br>Stats Uploaded Sucessfully"); 
		  });
	}
}
function keyEvents(event){
	// Cast to lower to prevent caps lock sliding 
	var key = (event.key).toLowerCase();

	var moveMap = { 
		'a': { "dx": -1, "dy": 0},
		's': { "dx": 0, "dy": 1},
		'd': { "dx": 1, "dy": 0},
		'w': { "dx": 0, "dy": -1}
	};

	switch (event.type){
		case "keyup":
			if (key in moveMap) {
				keyIsPressed[key] = false; 
				let x = 0, y = 0
				for (button in keyIsPressed) {
					if (keyIsPressed[button]) { 
						x += moveMap[button].dx;
						y += moveMap[button].dy;				
					}
				}
				stage.player.move(x, y);
			} else if (key === 'r') {
				stage.player.reload(); 
			}  else if (key === 'q') {
				isPickingUp = false; 
			} 
			break;
		case "keydown":
			if(key in moveMap){
				let x = 0, y = 0
				keyIsPressed[key] = true; 
				for (button in keyIsPressed) {
					if (keyIsPressed[button]) { 
						x += moveMap[button].dx;
						y += moveMap[button].dy;				
					}
				}
				stage.player.move(x, y);
			} else if ([1, 2, 3, 4, 5].find( (value) => { return value ===  parseInt(key)})) {
				stage.player.selectGun(parseInt(key) - 1)
			} else if (key === 'q') {
				isPickingUp = true; 
			} else if (key === 'e') {
				toggleBuildMode ? toggleBuildMode = false : toggleBuildMode = true;
			} else if (key === 'escape') {
				if (!interval) {
					startGame();
					$("#pauseGame").hide()
				} else {
					pauseGame();
					$("#pauseGame").show()
				}
			}
			break; 
	}
	
}

function mouseUp(event) {
	if (toggleBuildMode) {
		isMouseDown = false; 
		let x = event.clientX, y = event.clientY;
		stage.player.endBuild(x, y); 
	} else {
		isMouseDown = false; 
	}
}

function mouseDown(event) {
	if (toggleBuildMode) {
		isMouseDown = false;
		let x = event.clientX, y = event.clientY;
		stage.player.startBuild(x, y); 
	} else {
		isMouseDown = true; 
	}
}

function mouseMouse(event) {
	let x = event.clientX, y = event.clientY;
	stage.player.mouseMouse(x, y);
}