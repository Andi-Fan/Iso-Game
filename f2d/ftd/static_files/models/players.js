// General player class, attributes all player entities share in common 
class EntityPlayer {
	constructor(stage, position, health, colour, speed, radius) {
		this.stage = stage;
		this.position=position;
		this.maxHealth = this.health = health;
		this.colour = colour; 
        this.direction = new Pair(0, 0);
        this.radius = radius;
		this.face = new Pair(this.radius, 0);
        this.hooked = false; 
        this.speed = speed;
		this.gun = [];
		this.headColor = headcolor;
        this.selectedGun = 0; 
	}

    // Set the direction for the player to move in 
	move(dx, dy) {
		this.direction.x = dx;
		this.direction.y = dy;
    }
    
    // Change weapon
	selectGun(select) { 
		if (select >= 0 && select < this.gun.length) this.selectedGun = select;  
    }
    
    // Fire a shot
	shoot() {
		var direction = new Pair(this.face.x, this.face.y);
		direction.normalize(); 
		this.gun[this.selectedGun].shoot(this.position, this.face, direction)
    }
    
    //Reload gun
	reload() {
		this.gun[this.selectedGun].reload();
	}

	// Add item to inventory 
	additem(item) {
		let itemClassName = item.constructor.name
		for (let i = 0; i < this.gun.length; i++) {
			let curClassName = this.gun[i].constructor.name
			if (itemClassName === curClassName) {
				this.gun[i].addAmmo(randintrange(5, 20));
				return;
			}
		}
		this.gun.push(item); 
	}	

    // Check is going out of bounds in the X direction
	outOfBoundsX(dy) {
		return (pointCircleCollision(this.position.x, 0, this) && dy < 0) || 
		(pointCircleCollision(this.position.x, this.stage.height - this.stage.paddingHeight, this) && dy > 0)
    }
    
    // Check is going out of bounds in the Y direction
	outOfBoundsY(dx) {
		return (pointCircleCollision(0, this.position.y, this) && dx < 0) ||
		(pointCircleCollision(this.stage.width - this.stage.paddingWidth, this.position.y, this) && dx > 0)
	}

    // Grapple towards the hooked object
	grapple() {
		// Move the player
		this.position.x += this.hooked.direction.x * this.hooked.bulletSpeed;
		this.position.y += this.hooked.direction.y * this.hooked.bulletSpeed;
        this.hooked.travelled += this.hooked.bulletSpeed
        
		// Make sure player cannot exceed the X boundaries 
		if (this.outOfBoundsX(this.hooked.direction.y)) {
			this.stage.removeActor(this.hooked);
			this.hooked = undefined
			this.move(0, 0)
			return 
		} 

		// Make sure player cannot exceed the Y boundaries 
		if (this.outOfBoundsY(this.hooked.direction.x)) {
			this.stage.removeActor(this.hooked);
			this.hooked = undefined
			this.move(0, 0)
			return 
        }
        
        // Check if we have reached our hooked object 
		if (this.contains(this.hooked.hookedActor)) {
			this.position.x += this.hooked.direction.oppsiteDirection().x * (this.hooked.bulletSpeed);
			this.position.y += this.hooked.direction.oppsiteDirection().y * (this.hooked.bulletSpeed);
			this.hooked.length = 0; 
			this.hooked.hookedActor = undefined; 
			this.hooked = undefined;
			return 
        } 
        
        // It is possible to strafe while being pulled, so they may miss the desired object, 
        // max sure they only travel the distance the grappling hook was shot for 
		if (this.hooked.maxLength - this.hooked.length < this.hooked.travelled) {
			this.hooked.length = 0; 
			this.hooked.hookedActor = undefined; 
			this.hooked = undefined;
			return 
		}
	}

}

// The class for the actual player 
class Player extends EntityPlayer {
	constructor(stage, position){
		super(stage, position, 150, bodycolor, 5, 30)
		this.id = "PLAYER";
		this.timeSurvived = 0;
		this.enemiesKilled = 0; 
		this.building; 
		this.additem(new RegularGun(this.stage, this));
		this.additem(new GrapplingHook(this.stage, this));
		this.startTimer();
	}
    
    // Update the player
	step() {
        if (this.health <= 0) { this.stage.endGame(); }
        if (isMouseDown) { this.shoot(this.face.x, this.face.y); }
		if (this.hooked) { this.grapple(); } 
		
		// Check to see if you are colliding with anyone 
        this.stage.isColliding(this);
        
		let move = new Pair(this.direction.x, this.direction.y);
		if (this.outOfBoundsX(move.y)) { move.y =  0; } 
		if (this.outOfBoundsY(move.x)) { move.x =  0; }
        // Move in a way to avoid collisions
		move.normalize();
		this.position.x += move.x * this.speed;
		this.position.y += move.y * this.speed;
	}

    // Check for things the player is able to collide with
	collide(actor) {
		let move = new Pair(0 ,0);
		let oppsiteDirection;
		switch(actor.id) {
			case "BARREL":
				if (this.direction.y != 0 || this.direction.x != 0 ) {
					move.y = -(actor.position.x - this.position.x);
					move.x = actor.position.y - this.position.y;
					this.move(move.x, move.y)
				}
				break; 
			case "CRATE":
				oppsiteDirection = this.direction.oppsiteDirection();
				this.move(oppsiteDirection.x, oppsiteDirection.y)
				break; 
			case "BUILD":
				oppsiteDirection = this.direction.oppsiteDirection();
				this.move(oppsiteDirection.x, oppsiteDirection.y)
				break; 
		}
		
    }
    
    // Check to see what things the player maybe colliding with
    contains(actor) {
		switch(actor.id) {
			case "ENEMY":
				return circleCircleCollision(this, actor, 1);
			case "BARREL":
				return circleCircleCollision(actor, this, actor.sizeMultiplier);
			case "CRATE":
				return rectCircleCollision(this, actor, 1);
			case "BUILD":
				return lineCircleCollision(actor.pos1, actor.pos2, this, 1);
		}
	}

    // Surival timer 
	startTimer() {
		this.timer = setInterval(() => {
			this.timeSurvived++; 
		}, 1000);
	}

    // Move the face to the mouse 
	mouseMouse(dx, dy) {
		// Compute big tringle 
		let opp = dy - this.position.y - this.stage.translateY,
		adj = dx - this.position.x - this.stage.translateX,
		point = new Pair(adj, opp);

		// Make it a smaller unit triangle 
		point.normalize();
		
		// Scale to be the same size as player 
		point.x *= this.radius; 
		point.y *= this.radius; 

		this.face.x = point.x;
		this.face.y = point.y; 
	}

	// Generate a minimap (copy of canvas to draw)
	createMinimap() {
		//create a new canvas
		var newCanvas = document.createElement('canvas');
		var context = newCanvas.getContext('2d');

		//set dimensions
		newCanvas.width = this.stage.width;
		newCanvas.height = this.stage.height;

		//apply the old canvas to the new one
		context.drawImage(this.stage.canvas, 0, 0, this.stage.width, this.stage.height);

		return newCanvas;
	}

	// Start building a wall for yourself
	startBuild(dx, dy) {
		dy = dy - this.stage.translateY,
		dx = dx - this.stage.translateX;
		this.building = new Build(this.stage, new Pair(dx, dy))
	}

	// Place endpoint for the building
	endBuild(dx, dy) {
		dy = dy - this.stage.translateY,
		dx = dx - this.stage.translateX;
		if (this.building) this.building.finishBuild(dx, dy);
	}

    // Draw the player
	draw(context){
		// Draw the body
		context.beginPath(); 
		context.fillStyle = bodycolor;
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   
		// Draw the body outline 
		context.beginPath(); 
		context.strokeStyle = 'black';
		context.lineWidth = 2; 
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();   
		// Draw the face
		context.beginPath(); 
		context.fillStyle = this.gun[this.selectedGun].color;
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2, 0, 2 * Math.PI, false); 
		context.fill(); 
		// Draw the ammo indicator around the case
		context.beginPath(); 
		context.strokeStyle = headcolor;
		context.lineWidth = 5; 
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2.5, 0, (2*(this.gun[this.selectedGun].magazine/this.gun[this.selectedGun].magazineCapactity) * Math.PI), false); 
		context.stroke()
		// Draw the face outline 
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.lineWidth = 2; 
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2, 0, 2 * Math.PI, false); 
		context.stroke();   
		// Draw filled in red area 
		var borderWidth = 2;
		context.lineWidth = borderWidth; 
		context.beginPath();
		context.fillStyle = 'red';
		context.fillRect(this.position.x - this.radius +  1, this.position.y + this.radius + borderWidth + 1, this.radius*2 - 2, 20 - borderWidth); 
		context.fill();
		// Draw filled in green area
		context.beginPath();
		context.fillStyle = 'green';
		context.fillRect(this.position.x - this.radius +  1, this.position.y + this.radius + borderWidth + 1, this.radius*2*(this.health/this.maxHealth) - 2, 20 - borderWidth); 
		context.fill();
		// Draw Health Bar Outline
		context.beginPath();
		context.strokeStyle = 'black';
		context.rect(this.position.x - this.radius, this.position.y + this.radius + borderWidth, this.radius*2, 20); 
		context.stroke();
		
		//Draw minimap 
		let minimapBorderWidth = 5,
		mapSize = 350; 
		let centerX = this.stage.width - (this.stage.width/this.stage.mapScale) - this.stage.translateX - mapSize - this.stage.paddingWidth
		let centerY = minimapBorderWidth - 1 - this.stage.translateY
		
		if (this.position.y <= this.stage.height/(2*this.stage.mapScale)) {
			centerY = minimapBorderWidth + 1 + this.stage.translateY
		} else if (this.position.y >= this.stage.height - (this.stage.height/(2*this.stage.mapScale)) - this.stage.paddingHeight ) {
			centerY = minimapBorderWidth - 1 - this.stage.translateY
		}
		// Minimap 
		context.beginPath();
		context.strokeStyle = "black";
		context.lineWidth = minimapBorderWidth; 
		context.drawImage(this.createMinimap(), centerX, centerY, mapSize, mapSize);
		context.rect(centerX, centerY, mapSize, mapSize);
		context.stroke();
		
		// Draw Stats Text:
		context.beginPath();
		let fontSize = 40;
		context.font = `${fontSize}px MobFont`;
		context.fillStyle = "black";
		centerX = (this.position.x - (context.canvas.width/2))
		centerY = -this.stage.translateY + 50
		if (this.position.x <= this.stage.width/(2*this.stage.mapScale) || 
			this.position.x >= this.stage.width - (this.stage.width/(2*this.stage.mapScale)) - this.stage.paddingWidth) {
			centerX = (this.stage.width/(2*this.stage.mapScale) - (context.canvas.width/2)) - this.stage.translateX
		}
		if (this.position.y <= this.stage.height/(2*this.stage.mapScale)) {
			centerY = 50 + this.stage.translateY
		} else if (this.position.y >= this.stage.height - (this.stage.height/(2*this.stage.mapScale)) - this.stage.paddingHeight ) {
			centerY = 50 - this.stage.translateY
		}
		context.fillText(`Time Taken: ${this.timeSurvived} Seconds`, centerX, centerY); 
		context.fillText(`Enemies Killed: ${this.enemiesKilled}`, centerX, centerY + fontSize); 
		context.fillText(`Enemies Remaining: ${this.stage.numOfEnemies}`, centerX, centerY + fontSize*2);
		
		// Draw Storm text 
		var stormText = "";
		if (this.stage.storm.isStarted && this.stage.storm.isDone) {
			stormText = "Storm Completed"
		} else if (!this.stage.storm.isStarted) {
			stormText = "Storm Starting in: " + (this.stage.storm.startStormIn - this.stage.storm.time)
		} else if (this.stage.storm.isStarted && this.stage.storm.isShirnking) {
			stormText = "Shrinking Play Field"
		} else {
			stormText = "Shrinking In: " + (this.stage.storm.interValOfShrink - (this.stage.storm.time % this.stage.storm.interValOfShrink))
		}
		context.fillText(stormText, centerX, centerY + fontSize*3); 
		context.fill()

		// Draw Gun Text:
		centerY = (this.position.y + (context.canvas.height/2))
		if (this.position.y <= this.stage.height/(2*this.stage.mapScale)) {
			centerY = this.stage.translateY + (this.stage.height/(2*this.stage.mapScale) + (context.canvas.height/2))
		} else if (this.position.y >= this.stage.height - (this.stage.height/(2*this.stage.mapScale)) - this.stage.paddingHeight ) {
			centerY = (this.stage.height/(2*this.stage.mapScale) + (context.canvas.height/2)) - this.stage.translateY
		}
		context.beginPath();
		context.font = `${fontSize}px MobFont`;
		context.fillStyle = "black";
		context.fillText(`${this.gun[this.selectedGun].constructor.name}:${this.gun[this.selectedGun].magazine}/${this.gun[this.selectedGun].magazineCapactity}`, centerX, centerY - fontSize*2)
		context.fillText(`Ammo Left: ${this.gun[this.selectedGun].capacity}`, centerX, centerY - fontSize); 
		let invStoryString = 'Inventory (KeyNum, Gun): '; 
		// Draw Inventory 
		for (let j = 0; j < this.gun.length; j++) {
			invStoryString += `${j+1}:${this.gun[j].constructor.name} `
		}
		context.fillText(invStoryString, centerX, centerY);
		context.fill()
		
	}
}

// Regular gun AI to play against the player 
class EnemyRegular extends EntityPlayer {
	constructor(stage, position){
		super(stage, position, 60, 'rgba('+255+','+0+','+125+','+1+')', 4, 25)
		this.steps = 0; 
		this.searchRadius = 15; 
		this.face = new Pair(this.radius, 0);
		this.additem(new RegularGun(stage, this)); 
		this.id = "ENEMY";
	}

    // Move in certain ways, i.e move towards player when they are in a 
    // certain range and shoot at them
	collide(actor) {
		let move = new Pair(0 ,0)
		switch(actor.id) {
			case "PLAYER":
				move.x = randintrange(0, actor.position.x - this.position.x);
				move.y = randintrange(0, actor.position.y - this.position.y);
				if (move.x < randintrange(125, 200)) {move.x = 0;}
				if (move.y < randintrange(125, 200)) {move.y = 0;}
				this.mouseMouse(actor.position.x, actor.position.y); 
				if (randintrange(0,1) > 0.4){ this.shoot(); }
				break; 
			case "ENEMY":
				move = actor.direction.oppsiteDirection(); 
				this.mouseMouse(actor.position.x, actor.position.y); 
				if (rand(1) > 0.4){ this.shoot(); }
				break;  
			case "BARREL": 
				move.y = -(actor.position.x - this.position.x);
				move.x = actor.position.y - this.position.y;
				break; 
			case "BUILD":
			case "CRATE":
				let oppsiteDirection = this.direction.oppsiteDirection();
				this.move(oppsiteDirection.x, oppsiteDirection.y)
				break;
		}
		this.move(move.x, move.y)
    }
    
    // Check if the player is on our range, or if AI is colliding with something
    contains(actor) {
		switch(actor.id) {
			case "ENEMY":
			case "PLAYER": 
				return circleCircleCollision(this, actor, this.searchRadius);
			case "BARREL":
				return circleCircleCollision(actor, this, actor.sizeMultiplier);
			case "CRATE":
				return rectCircleCollision(this, actor, 1);
			case "BUILD":
				return lineCircleCollision(actor.pos1, actor.pos2, this, 1);
		}
	}

    // Update the AI
	step() {
		if (this.health <= 0) { this.stage.numOfEnemies--; this.stage.removeActor(this); }
        if (this.gun[this.selectedGun].magazine === 0) { this.reload(); }
        if (this.hooked) { this.grapple(); }; 
        // Pick a new direction once the player has moved 50 steps in a certain direction
		if (this.steps % 50 === 0) { this.move(randintrange(-1, 1), randintrange(-1, 1)); }

		this.stage.isColliding(this);
        
        let move = new Pair(this.direction.x, this.direction.y);
		if (this.outOfBoundsX(move.y)) { move.y =  0; } 
		if (this.outOfBoundsY(move.x)) { move.x =  0; }

		this.steps++; this.steps %= 50; 
		move.normalize();

		this.position.x += move.x * this.speed;
		this.position.y += move.y * this.speed;
	}

    // Update the direction the AI is looking in 
	mouseMouse(dx, dy) {
		// Compute big tringle 
		let opp = dy - this.position.y,
		adj = dx - this.position.x,
		point = new Pair(adj, opp);

		// Make it a smaller unit triangle 
		point.normalize();
		
		// Scale to be the same size as player 
		point.x *= this.radius; 
		point.y *= this.radius; 

		this.face.x = point.x;
		this.face.y = point.y; 
	}

    // Draw AI
	draw(context){
		// Draw the player
		context.beginPath(); 
		context.fillStyle = this.colour;
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   
		// Draw the body outline 
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.lineWidth = 2; 
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();   
		// Draw the face
		context.beginPath(); 
		context.fillStyle = this.gun[this.selectedGun].color;
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2, 0, 2 * Math.PI, false); 
		context.fill(); 
		// Draw the ammo indicator around the case
		context.beginPath(); 
		context.strokeStyle = 'rgba('+255+','+0+','+0+','+1+')';
		context.lineWidth = 5; 
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2.5, 0, (2*(this.gun[this.selectedGun].magazine/this.gun[this.selectedGun].magazineCapactity) * Math.PI), false); 
		context.stroke()
		// Draw the face outline 
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.lineWidth = 2; 
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2, 0, 2 * Math.PI, false); 
		context.stroke();   
		// Draw filled in red area 
		var borderWidth = 2;
		context.beginPath();
		context.lineWidth = borderWidth; 
		context.fillStyle = 'red';
		context.fillRect(this.position.x - this.radius +  1, this.position.y + this.radius + borderWidth + 1, this.radius*2 - 2, 20 - borderWidth); 
		context.fill();
		// Draw filled in green area
		context.beginPath();
		context.fillStyle = 'green';
		context.fillRect(this.position.x - this.radius +  1, this.position.y + this.radius + borderWidth + 1, this.radius*2*(this.health/this.maxHealth) - 2, 20 - borderWidth); 
		context.fill();
		// Draw Health Bar Outline
		context.beginPath();
		context.strokeStyle = 'black';
		context.rect(this.position.x - this.radius, this.position.y + this.radius + borderWidth, this.radius*2, 20); 
		context.stroke();
	}
}

// Regular gun AI to play against the player 
class EnemyShotgun extends EntityPlayer {
	constructor(stage, position){
		super(stage, position, 45, 'rgba('+255+','+0+','+125+','+1+')', 3, 25)
		this.steps = 0; 
		this.searchRadius = 25; 
		this.face = new Pair(this.radius, 0);
		this.additem(new ShotGun(stage, this)); 
		// Give AI grappling gun and a lot of grappling ammo
		for (let i = 0; i < 5; i++) {
			this.additem(new GrapplingHook(stage, this)); 
		}
		this.id = "ENEMY";
	}

    // Move in certain ways, i.e move towards player when they are in a 
    // certain range and shoot at them
	collide(actor) {
		let move = new Pair(0 ,0)
		switch(actor.id) {
			case "PLAYER":
				move.x = actor.position.x - this.position.x;
				move.y = actor.position.y - this.position.y;
				let randx = 0, randy = 0;
				if (move.magnitude() <= 100) {
					this.selectGun(0)
				} else {
					this.selectGun(1)
					if (rand(1) > 0.1 ){ randx = randintrange(-20, 20) }
					if (rand(1) > 0.1 ) { randy = randintrange(-20, 20) }
				}
				this.mouseMouse(actor.position.x + randx, actor.position.y + randy); 
				this.shoot();
				break; 
			case "ENEMY":
				move = actor.direction.oppsiteDirection(); 
				if (move.magnitude() <= 100) {this.selectGun(0)}
				else {this.selectGun(1)}
				this.mouseMouse(actor.position.x, actor.position.y); 
				if (rand(1) > 0.4){ this.shoot(); }
				break;  
			case "BARREL": 
				move.y = -(actor.position.x - this.position.x);
				move.x = actor.position.y - this.position.y;
				break; 
			case "BUILD":
			case "CRATE":
				let oppsiteDirection = this.direction.oppsiteDirection();
				this.move(oppsiteDirection.x, oppsiteDirection.y)
				break;
		}
		this.move(move.x, move.y)
    }
    
    // Check if the player is on our range, or if AI is colliding with something
    contains(actor) {
		switch(actor.id) {
			case "ENEMY":
			case "PLAYER": 
				if (this.hooked) return circleCircleCollision(this, actor, 1);
				return circleCircleCollision(this, actor, this.searchRadius);
			case "BARREL":
				return circleCircleCollision(actor, this, actor.sizeMultiplier);
			case "CRATE":
				return rectCircleCollision(this, actor, 1);
			case "BUILD":
				return lineCircleCollision(actor.pos1, actor.pos2, this, 1);
		}
	}

    // Update the AI
	step() {
		if (this.health <= 0) { this.stage.numOfEnemies--; this.stage.removeActor(this); }
        if (this.gun[this.selectedGun].magazine === 0) { this.reload(); }
        if (this.hooked) { this.grapple(); this.stage.isColliding(this); return; }; 
        
        // Pick a new direction once the player has moved 50 steps in a certain direction
		if (this.steps % 50 === 0) { this.move(randintrange(-1, 1), randintrange(-1, 1)); }
		this.stage.isColliding(this);
        
        let move = new Pair(this.direction.x, this.direction.y);
		if (this.outOfBoundsX(move.y)) { move.y =  0; } 
		if (this.outOfBoundsY(move.x)) { move.x =  0; }

		this.steps++; this.steps %= 50; 
		move.normalize();

		this.position.x += move.x * this.speed;
		this.position.y += move.y * this.speed;
	}

    // Update the direction the AI is looking in 
	mouseMouse(dx, dy) {
		// Compute big tringle 
		let opp = dy - this.position.y,
		adj = dx - this.position.x,
		point = new Pair(adj, opp);

		// Make it a smaller unit triangle 
		point.normalize();
		
		// Scale to be the same size as player 
		point.x *= this.radius; 
		point.y *= this.radius; 

		this.face.x = point.x;
		this.face.y = point.y; 
	}

    // Draw AI
	draw(context){
		// Draw the player
		context.beginPath(); 
		context.fillStyle = this.colour;
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.fill();   
		// Draw the body outline 
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.lineWidth = 2; 
		context.arc(this.position.x, this.position.y, this.radius, 0, 2 * Math.PI, false); 
		context.stroke();   
		// Draw the face
		context.beginPath(); 
		context.fillStyle = this.gun[this.selectedGun].color;
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2, 0, 2 * Math.PI, false); 
		context.fill(); 
		// Draw the ammo indicator around the case
		context.beginPath(); 
		context.strokeStyle = 'rgba('+255+','+0+','+0+','+1+')';
		context.lineWidth = 5; 
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2.5, 0, (2*(this.gun[this.selectedGun].magazine/this.gun[this.selectedGun].magazineCapactity) * Math.PI), false); 
		context.stroke()
		// Draw the face outline 
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.lineWidth = 2; 
		context.arc(
			this.position.x + this.face.x, 
			this.position.y + this.face.y, 
			this.radius / 2, 0, 2 * Math.PI, false); 
		context.stroke();   
		// Draw filled in red area 
		var borderWidth = 2;
		context.beginPath();
		context.lineWidth = borderWidth; 
		context.fillStyle = 'red';
		context.fillRect(this.position.x - this.radius +  1, this.position.y + this.radius + borderWidth + 1, this.radius*2 - 2, 20 - borderWidth); 
		context.fill();
		// Draw filled in green area
		context.beginPath();
		context.fillStyle = 'green';
		context.fillRect(this.position.x - this.radius +  1, this.position.y + this.radius + borderWidth + 1, this.radius*2*(this.health/this.maxHealth) - 2, 20 - borderWidth); 
		context.fill();
		// Draw Health Bar Outline
		context.beginPath();
		context.strokeStyle = 'black';
		context.rect(this.position.x - this.radius, this.position.y + this.radius + borderWidth, this.radius*2, 20); 
		context.stroke();
	}
}