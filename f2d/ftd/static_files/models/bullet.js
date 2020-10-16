var count = 0; 
var grenadeImage = new Image();
grenadeImage.onload = () => {
	count++
	console.log(count)
}
grenadeImage.src = "../assets/unamed.png";

var explosionImage = new Image();
explosionImage.onload = () => {
	count++
	console.log(count)
}
explosionImage.src = "../assets/explosions.gif";

// General generic bullet to fire 
class Bullet {
	constructor(stage, playerFired, position, direction, damage, colour, radius){
		this.stage = stage;
		this.playerFired = playerFired; 
		this.position=position;
		this.direction=direction;
		this.damage = damage;
		this.colour = colour;
		this.radius = radius;
		this.id = "BULLET";
	}

    // Check if bullet went out of bounds in X direction
	outOfBoundsX(dy) {
		return (pointCircleCollision(this.position.x, 0, this) && dy < 0) || 
		(pointCircleCollision(this.position.x, this.stage.height - this.stage.paddingHeight, this) && dy > 0)
	}

    // Check if bullet went out of bounds in Y direction
	outOfBoundsY(dx) {
		return (pointCircleCollision(0, this.position.y, this) && dx < 0) ||
		(pointCircleCollision(this.stage.width - this.stage.paddingWidth, this.position.y, this) && dx > 0)
	}

    // Check if bullet is colliding with anything it is able to
	contains(actor) {
		if (this.playerFired === actor) return; 
		switch(actor.id) {
			case "BARREL":
				return circleCircleCollision(actor, this, actor.sizeMultiplier);
			case "ENEMY":
				return circleCircleCollision(this, actor);
			case "PLAYER":
				return circleCircleCollision(this, actor);
			case "CRATE":
				return rectCircleCollision(this, actor);
			case "BUILD":
				return linePointCollision(actor.pos1, actor.pos2, this.position);
		}
	}

    // If colliding with something deal damage, and delete bullet
	collide(actor) {
		switch(actor.id) {
			case "ENEMY":
				actor.health -= this.damage; 
				if (actor.health <= 0) {
					this.playerFired.enemiesKilled++
				} 
				break;
			case "CRATE":
			case "BARREL":
			case "PLAYER":
			case "BUILD":
				actor.health -= this.damage; 
				break; 
			
		}
		this.stage.removeActor(this);
	}

    // Update bullet in travel
	step(){
		//Move
		this.position.x += this.direction.x;
		this.position.y += this.direction.y;

		// Delete if it hits the walls
		if (this.outOfBoundsX(this.direction.y) || this.outOfBoundsY(this.direction.x)) {
			this.stage.removeActor(this);
			return; 
		} 

		// Check if we hit any other actor. 
		this.stage.isColliding(this)
	}

    // Draw bullet 
	draw(context){
		// Draw Bullet
		context.beginPath(); 
		context.fillStyle = this.colour;
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   

		// Draw bullet outline 
		context.beginPath(); 
		context.strokeStyle = 'black';
		context.lineWidth = 2
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();   
	}
}

// Speciallizied bullet for the grappling hook gun 
class Hook extends Bullet{
	constructor (stage, playerFired, position, direction, bulletSpeed, color) {
		super(stage, playerFired, position, direction, 0, color, 10)
		this.bulletSpeed = bulletSpeed; 
		this.hookedActor; 
		this.travelled = 0; 
		this.maxLength = this.length = 750; 
		this.id = "BULLET";
	}

    // set hooked objects on collision
	collide(actor) {
		switch(actor.id) {
			case "PLAYER":
			case "ENEMY":
			case "CRATE":
			case "BARREL":
			case "BUILD":
				this.playerFired.hooked = this;
				this.hookedActor = actor;
				break;
		}
	}

    // Update hook bullet 
	step() {
		// Delete if it hits the walls
		if (this.outOfBoundsX(this.direction.y) || this.outOfBoundsY(this.direction.x)) {
			this.stage.removeActor(this);
			return; 
		} 

		if (this.length > 0) {
			// If we havent latched on to something keep searching
			if (!this.hookedActor) {
				this.position.x += this.direction.x*this.bulletSpeed;
				this.position.y += this.direction.y*this.bulletSpeed;
				
				// Check if we hit any other actor. 
				this.stage.isColliding(this)
			}

			// Distance left to search
			this.length -= this.bulletSpeed;
		} else  { this.stage.removeActor(this) }
	}

    // Draw hook
	draw(context) {
		// Draw Line from player to hook
		context.beginPath(); 
		context.strokeStyle = "black"
		context.lineWidth = 5; 
		context.moveTo(this.playerFired.position.x + this.playerFired.face.x, 
			this.playerFired.position.y + this.playerFired.face.y);
		context.lineTo(this.position.x, this.position.y);
		context.stroke();

		// Draw hook at the end of line 
		context.beginPath(); 
		context.lineWidth = 1; 
		context.fillStyle = this.colour;
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   

		// Draw hook outline 
		context.beginPath(); 
		context.strokeStyle = 'black';
		this.lineWidth = 2;
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();   
	}
}

// Custom bullet for grenade launcher 
class Grenade extends Bullet {
	constructor (stage, playerFired, position, direction, bulletSpeed, color) {
		super(stage, playerFired, position, direction, 50, color, 15)
		this.bulletSpeed = bulletSpeed; 
		this.id = "GRENADE"
		this.explosionRadius = 1.5; 
		this.sizeMultiplier = 5; 
		this.explode = false; 
	}

	detonate() {
		setInterval(() => {
			this.explode = true;
		}, 500)
	}

	// Update bullet in travel
	step(){
		if (this.done) this.stage.removeActor(this); 
		//Move
		this.position.x += this.direction.x;
		this.position.y += this.direction.y;

		// Delete if it hits the walls
		if (this.outOfBoundsX(this.direction.y) || this.outOfBoundsY(this.direction.x)) {
			this.stage.removeActor(this);
			return; 
		} 

		// Check if we hit any other actor. 
		this.stage.isColliding(this)
	}


    // set hooked objects on collision
    // If colliding with something deal damage, and delete bullet
	collide(actor) {
		if (this.playerFired === actor) return; 
		switch(actor.id) {
			case "ENEMY":
				actor.health -= this.damage; 
				if (actor.health <= 0) {
					this.playerFired.enemiesKilled++
				} 
				break;
			case "CRATE":
			case "BARREL":
			case "PLAYER":
			case "BUILD":
				actor.health -= this.damage; 
				break; 
			
		}
		this.explode = true; 
	}

	// Check if bullet is colliding with anything it is able to
	contains(actor) {
		switch(actor.id) {
			case "BARREL":
				return circleCircleCollision(actor, this, actor.sizeMultiplier, this.explosionRadius);
			case "ENEMY":
				return circleCircleCollision(this, actor, this.explosionRadius);
			case "PLAYER":
				return circleCircleCollision(this, actor, this.explosionRadius);
			case "CRATE":
				return rectCircleCollision(this, actor, this.explosionRadius);
			case "BUILD":
				return linePointCollision(actor.pos1, actor.pos2, this.position);
		}
	}


	// Draw bullet 
	draw(context){
		// Draw Nade
		context.beginPath(); 		
		context.drawImage(grenadeImage, this.position.x, this.position.y, this.radius*this.sizeMultiplier, this.radius*this.sizeMultiplier);
		// Draw bullet outline 
		if (this.explode) {
			context.beginPath(); 
			context.drawImage(explosionImage, this.position.x, this.position.y, this.radius*this.sizeMultiplier, this.radius*this.sizeMultiplier);
			this.done = true; 
		}
	}
}