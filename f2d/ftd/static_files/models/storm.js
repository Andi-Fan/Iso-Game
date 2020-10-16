// Storm Class
class Storm {
	constructor(stage) {
		this.stage = stage; 
		this.targetRadius = this.stage.height/(2*this.stage.mapScale)
		this.position = new Pair(randintrange(this.stage.paddingWidth + this.targetRadius, this.stage.width - this.stage.paddingWidth - this.targetRadius),
		randintrange(this.stage.paddingHeight + this.targetRadius, this.stage.height - this.stage.paddingHeight - this.targetRadius))
		this.radius = this.stage.width/2 + Math.abs(this.stage.width/2 - this.position.x) ;
		this.shrinkRate = 1;
		this.damage = 1; 
		this.startStormIn = 20; 
		this.interValOfShrink = 10; 
		this.isShirnking = false;
		this.isDone = false; 
		this.isStarted = false;
		this.time = 0;
		this.id = "STORM"
		this.timer();
	}

	// Storm only collides with enemies and player, deals damage to both
	collide(actor){
		switch(actor.id) {
			case "ENEMY":
				let move = new Pair(0 , 0)
				move.x = randintrange(0, this.position.x - actor.position.x);
				move.y = randintrange(0, this.position.y - actor.position.y);
				actor.mouseMouse(move.x, move.y); 
				actor.move(move.x, move.y)
				actor.health -= this.damage; 
				break
			case "PLAYER":
				actor.health -= this.damage; 
				break; 
		}
	}

	// Check if players and enemies arent within the safe zone 
	contains(actor) {
		switch(actor.id) {
			case "ENEMY":
			case "PLAYER":
				return !circleCircleCollision(this, actor, 1); 

		}
	}

	// Update the storm 
	step() {
		if (this.isStarted && this.isShirnking && this.radius > this.targetRadius) { this.radius -= this.shrinkRate; } 
		if (this.radius <= this.targetRadius) {this.isDone = true;  clearInterval(this.stormTimer) }
		if (this.isStarted) this.stage.isColliding(this);
	}

	// Timer for storm, shrinks on certain intervals 
	timer() {
		this.stormTimer = setInterval(() => {
			this.time++; 
			if (this.isStarted == false && this.time % this.startStormIn === 0) { this.isStarted = true;}
			if (this.isStarted && this.time % this.interValOfShrink === 0) {this.isShirnking ? this.isShirnking = false : this.isShirnking = true}
		}, 1000)
	}

	// Draw the storm 
	draw(context) {
		if (this.isStarted) {
			//Draw the storm
			context.beginPath();
			context.fillStyle = "rgba(255, 0, 0, 0.4)";
			context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
			context.rect(this.stage.width, 0, -this.stage.width, this.stage.height);
			context.fill();
			//Draw Outline Around Storm Play Area
			context.beginPath();
			context.strokeStyle = "rgba(0, 0, 0, 1)";
			context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI);
			context.stroke();
		}
	}
}





