// Drop items on the floor for player to pick up
class droppedItem {
	constructor (stage, position, item) {
		this.stage = stage;
		this.position = position;
		this.radius = 20;
		this.searchRadius = 2;
		this.item = item;
		this.id = "DROPITEM"
	}


	step() {
		this.stage.isColliding(this)
	}

    // If player is near items and trying to pick them up, pick it up
	collide(actor) {
		switch(actor.id) {
			case "PLAYER":
				if(isPickingUp) {
					actor.additem(this.item);
					this.stage.removeActor(this)	
				}
				break; 
		}
	}

    // Check to see if player near items
	contains(actor) {
		switch(actor.id) {
			case "PLAYER":
				return circleCircleCollision(this, actor, this.searchRadius); 
		}
	}

    // Draw dropped items 
	draw(context) {
		// Draw item color 
		context.beginPath(); 
		context.fillStyle = this.item.color;
		context.arc(
			this.position.x, 
			this.position.y, 
			this.radius, 0, 2 * Math.PI, false); 
		context.fill(); 
		//Draw Item border 
		context.beginPath(); 
		context.strokeStyle = 'black';
		context.lineWidth = 2; 
		context.arc(
			this.position.x, 
			this.position.y, 
			this.radius, 0, 2 * Math.PI, false); 
		context.stroke();   

	}
}

// Barrel class, can drop items
class Barrel {
	constructor(stage, position) {
		this.stage = stage;
		this.direction = new Pair(0, 0);
		this.position = position;
		this.sizeMultiplier = 2; 
		this.AttemptToDrop = 3; 
		this.radius = this.health = 30; 
		this.id = "BARREL"
	}

    // Does not collide with anything since it is stationary, hence blank
	collide(actor) {
		return;
	}

    // If health below 0, drop items and delete
	step() {
		this.stage.isColliding(this); 
		if (this.health <= 0) {
			this.stage.removeActor(this);
			while (this.AttemptToDrop > 0) {
				let item = returnRandomItem(this.stage, this.stage.player)
				let randX = randintrange(-50, 50);
				let randY = randintrange(-50, 50);
				let position = new Pair(this.position.x + randX, this.position.y + randY)
				let dItem = new droppedItem(this.stage, position, item)
				let actor = this.stage.isColliding(dItem)
				if (!actor || actor && actor instanceof Bullet){
					this.stage.addActor(dItem);
				}
				this.AttemptToDrop--; 
			}
		} 
		else {this.radius = this.health;}
	}

    // Check if barrel is colliding with anything 
	contains(actor) {
        switch(actor.id) {
            case "ENEMY":
            case "PLAYER":
                return circleCircleCollision(actor, this);
            case "BARREL":
                return circleCircleCollision(actor, this, actor.sizeMultiplier, this.sizeMultiplier);
            case "CRATE":
                return rectCircleCollision(this, actor, this.sizeMultiplier);
        }
        return; 
	}

    // Draw Barrel
	draw(context){
		// Draw Barrel
		context.beginPath(); 
		context.fillStyle = 'rgba('+112+','+128+','+144+','+1+')';;
		context.arc(this.position.x, this.position.y, this.radius*this.sizeMultiplier, 0, 2 * Math.PI, false); 
		context.fill();   

		// Draw Detail
		context.beginPath(); 
		context.fillStyle = 'rgba('+47+','+79+','+79+','+1+')';;
		context.arc(this.position.x + this.radius/2, this.position.y - this.radius*this.sizeMultiplier/2, (this.radius/4)*this.sizeMultiplier, 0, 2 * Math.PI, false); 
		context.fill();   

		// Draw Outline
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.lineWidth = 2;
		context.arc(this.position.x, this.position.y, this.radius*this.sizeMultiplier, 0, 2 * Math.PI, false);
		context.stroke()
	}
}

// Crate class, can drop items
class Crate {
	constructor(stage, position) {
		this.stage = stage;
		this.direction = new Pair(0, 0);
		this.position = position;
		this.health = 40; 
		this.AttemptToDrop = 5;
		this.sizeMultiplier = 4;
		this.id = "CRATE"
	}

    // If health drops below 0, drop items and delete
	step() {
		if (this.health <= 0) {
			while (this.AttemptToDrop > 0) {
				let item = returnRandomItem(this.stage, this.stage.player)
				let randX = randintrange(-50, 50);
				let randY = randintrange(-50, 50);
				let position = new Pair(this.position.x + randX, this.position.y + randY)
				let dItem = new droppedItem(this.stage, position, item)
				let actor = this.stage.isColliding(dItem)
				if (!actor || actor && actor instanceof Bullet){
					this.stage.addActor(dItem);
				}
				this.AttemptToDrop--; 
			}
			this.stage.removeActor(this);
		} 
	}

    // This does not collide withing anything else, hence blank (since its stationary)
	collide(actor){
		return;
	}

    // Check to see if rectangle is colliding with anything 
	contains(actor) {
        switch(actor.id) {
            case "ENEMY":
            case "PLAYER":
                return rectCircleCollision(actor, this);
            case "BARREL":
                return rectCircleCollision(actor, this, actor.searchRadius);
            case "CRATE":
                return rectRectCollision(this, actor);
        }
		return; 
	}

    // Draw crate 
	draw(context){
		var size = this.health*this.sizeMultiplier; 
		// Draw Crate
		context.beginPath(); 
		context.fillStyle = 'rgba('+139+','+69+','+19+','+1+')';
		context.fillRect(this.position.x, this.position.y, size, size); 
		context.fill();   

		// Draw Inner Box
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		var innerWidth = 5; 
		var innerPadding = 20; 
		context.lineWidth = innerWidth; 
		context.rect(this.position.x + innerPadding, this.position.y + innerPadding, size - innerPadding*2, size - innerPadding*2); 
		context.stroke();   

		// Draw Inner Box Deatails 
		if (this.health > 10) {
			context.beginPath();  
			context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
			var innerWidth = 5; 
			var innerPadding = 20; 
			var linePadding = 10; 
			context.lineWidth = innerWidth; 
			context.moveTo(this.position.x + innerPadding, this.position.y + innerPadding + linePadding);
			context.lineTo(this.position.x + innerPadding + size - innerPadding*2 - linePadding, this.position.y + innerPadding + size - innerPadding*2);
			context.moveTo(this.position.x + innerPadding + linePadding, this.position.y + innerPadding);
			context.lineTo(this.position.x + innerPadding + size - innerPadding*2, this.position.y + innerPadding + size - innerPadding*2 - linePadding);
			context.moveTo(this.position.x + innerPadding + linePadding, this.position.y + innerPadding + size - innerPadding*2); 
			context.lineTo(this.position.x + innerPadding + size - innerPadding*2, this.position.y + innerPadding + linePadding);
			context.moveTo(this.position.x + innerPadding, this.position.y + innerPadding + size - innerPadding*2 - linePadding); 
			context.lineTo(this.position.x + innerPadding + size - innerPadding*2 - linePadding, this.position.y + innerPadding);
			context.stroke();   
		}
		
		// Draw Outline
		context.beginPath(); 
		context.strokeStyle = 'rgba('+0+','+0+','+0+','+1+')';
		context.lineWidth = 10;
		context.rect(this.position.x, this.position.y, this.health*this.sizeMultiplier, this.health*this.sizeMultiplier);
		context.stroke()
	}
}
