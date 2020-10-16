// Generate canvas stage 
class Stage {
	constructor(canvas, savedBodyColor, savedHeadColor){
		this.canvas = canvas;
	
		this.actors=[]; // all actors on this stage (monsters, player, boxes, ...)
		this.player=null; // a special actor, the player
	
		// the logical width and height of the stage
		this.mapScale = 2; 
		this.width=window.innerWidth * this.mapScale;
		this.height=window.innerHeight * this.mapScale;
		this.gridSpacing = 200; 
		this.paddingWidth = this.width%this.gridSpacing;
		this.paddingHeight = this.height%this.gridSpacing; 
        this.padding = 0;

        // Number of enemies to spawn in 
        this.numOfEnemies = 1; 

        // How many crates and barrels to spawn in 
        this.numOfSpawns = 10

        // Setp gameover 
		this.gameOver = false; 
		
		// This is our view 
		this.canvas.getContext('2d').canvas.width = window.innerWidth; 
        this.canvas.getContext('2d').canvas.height = window.innerHeight;
        
        // Randomly spawn in enemies 
        let counter = 0; 
        while (counter < this.numOfEnemies) {
			let x = randintrange(0 + this.paddingWidth + 200, this.width - this.paddingWidth - 200), 
			y = randintrange(0 + this.paddingHeight + 200, this.height - this.paddingHeight - 200),
			enemy,
			randomNumber = rand(1);
            if (randomNumber <= 0.2) enemy = new EnemyShotgun(this, new Pair(x, y));
            else enemy = new EnemyRegular(this, new Pair(x, y));;
            if (!this.getActor(enemy)) {
				counter++; 
				this.addActor(enemy);
			}
        }
        // Randomly Spawn barrels or crates 
		counter = 0;
		while (counter < 5) {
			let x = randintrange(0 + this.paddingWidth + 200, this.width - this.paddingWidth - 200), 
            y = randintrange(0 + this.paddingHeight + 200, this.height - this.paddingHeight - 200),
			mysterFloor = new MysterFloor(this, new Pair(x, y));
            if (!this.getActor(mysterFloor)) {
				counter++; 
				this.addActor(mysterFloor);
			}
		}
		counter = 0;
        while (counter < this.numOfSpawns) {
			let x = randintrange(0 + this.paddingWidth + 200, this.width - this.paddingWidth - 200), 
            y = randintrange(0 + this.paddingHeight + 200, this.height - this.paddingHeight - 200),
			randomNumber = rand(1),
            spawn;
            if (randomNumber >= 0.5) spawn = new Barrel(this, new Pair(x, y));
            else spawn = new Crate(this, new Pair(x, y));
            if (!this.getActor(spawn)) {
				counter++; 
				this.addActor(spawn);
			}
        }

        var colour= 'rgba('+0+','+255+','+255+','+1+')';
        // Find a place to spawn in the player
        while (true) {
			let x = randintrange(0 + this.paddingWidth + 200, this.width - this.paddingWidth - 200), 
            y = randintrange(0 + this.paddingHeight + 200, this.height - this.paddingHeight - 200),
            p = new Player(this, new Pair(x, y), savedBodyColor, savedHeadColor);
            if (!this.getActor(p)) {
                this.addPlayer(p)
                break;
            }
        }

        // Create the storm 
		this.storm = new Storm(this);
		this.addActor(this.storm); 
	}

    // Add and set main player
	addPlayer(player){
		this.addActor(player);
		this.player=player;
	}

    // Remove the player
	removePlayer(){
		this.removeActor(this.player);
		this.player=null;
	}

    // Add an actor 
	addActor(actor){
		this.actors.push(actor);
	}

    // Remove an actor 
	removeActor(actor){
		var index=this.actors.indexOf(actor);
		if(index!=-1){
			this.actors.splice(index,1);
		}
    }

    endGame(){
        this.gameOver = true;
    }
    
    // return the first actor at coordinates (x,y) return null if there is no such actor
	getActor(actor){
		for(var i=0;i<this.actors.length;i++){
			if(this.actors[i] !== actor && actor.contains(this.actors[i])) 
				return true;
		}
		return false;
	}

	// return the first actor at coordinates (x,y) return null if there is no such actor
	isColliding(actor){
		for(var i=0;i<this.actors.length;i++){
			if(actor !== this.actors[i] && actor.contains(this.actors[i])) {
				actor.collide(this.actors[i]);
			}
		}
		return null;
	}

	// Take one step in the animation of the game.  Do this by asking each of the actors to take a single step. 
	// NOTE: Careful if an actor died, this may break!
	step(){
		for(var i=0;i<this.actors.length && this.gameOver===false;i++){
			if (this.player === null) {  }
			else { this.actors[i].step(); }
		}
	}

    // Draw everything on the stage 
	draw(){
		var context = this.canvas.getContext('2d');
		context.clearRect(0, 0, this.width, this.height);
		context.save();
		context.beginPath();
		context.strokeStyle = "rgba("+0+","+0+","+0+","+0.6+")";
		context.lineWidth = 3; 

		this.translateX = (this.width/(2*this.mapScale) - this.player.position.x);
		this.translateY = (this.height/(2*this.mapScale) - this.player.position.y); 
		if (this.player.position.x <= this.width/(2*this.mapScale)) {
			this.translateX = 0; 
		} else if (this.player.position.x >= this.width - (this.width/(2*this.mapScale)) - this.paddingWidth ) {
			this.translateX = (this.paddingWidth + this.width/(this.mapScale) - (this.width)); 
		}
		if (this.player.position.y <= this.height/(2*this.mapScale)) {
			this.translateY = 0;
		} else if (this.player.position.y >= this.height - (this.height/(2*this.mapScale)) - this.paddingHeight ) {
			this.translateY = (this.paddingHeight + this.height/(this.mapScale) - (this.height)); 
		}
		context.translate(this.translateX, this.translateY);

		for (var x = 0; x <= this.width - this.paddingWidth; x += this.gridSpacing) {
			context.moveTo(0.5 + x + this.padding, this.padding);
			context.lineTo(0.5 + x + this.padding, this.height - this.paddingHeight);
		}
		
		for (var x = 0; x <= this.height - this.paddingHeight; x += this.gridSpacing) {
			context.moveTo(this.padding, 0.5 + x + this.padding);
			context.lineTo(this.width - this.paddingWidth, 0.5 + x + this.padding);
		}
		context.stroke();
		for(var i=0;i<this.actors.length;i++){
			if (this.actors[i] !== this.player && this.actors[i] !== this.storm)
			this.actors[i].draw(context);
		}
		this.player.draw(context);
		this.storm.draw(context);
		context.restore();
	}

} 
