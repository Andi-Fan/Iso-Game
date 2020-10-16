// Static variable, only one person can have a buff at a time. 
var canUse = true; 
class MysterFloor {
    constructor(stage, position) {
        this.stage = stage;
        this.position = position
        this.health = 10;
        this.sizeMultiplier = 10; 
        this.id = "MYSTERYFLOOR";
        this.cooldown = 10000; 
        this.duration = 5000; 
    }

    // Check if anyone is on the floor
    step() {
        this.stage.isColliding(this)
    }

    contains(actor) {
        switch(actor.id) {
            case "ENEMY":
            case "PLAYER":
                return rectCircleCollision(actor, this)
            case "BARREL":
                return rectCircleCollision(actor, this, actor.sizeMultiplier);
            case "MYSTERYFLOOR":
            case "CRATE":
                return rectRectCollision(this, actor);
        }
    }

    // Cannot be used for a certain amount of time after it goes down
    coolDown() {
        setTimeout(() => {
            canUse = true; 
        }, this.cooldown)
    }

    // When colliding with certain players it gives them a buff
    collide(actor) {
        switch(actor.id) {
            case "ENEMY":
            case "PLAYER":
                if (canUse) {
                    this.randomBuff(actor);
                    canUse = false;
                    this.coolDown();
                }
                break;
        }
    }

    // Potential buffs the player can get
    randomBuff(actor) {
        let x =rand(1) 
        let normalSpeed = actor.speed,
        normalRadius = actor.radius;
        if ( x < 0.05 )
            actor.health = 0; 
        else if ( x < 0.1)  {
            actor.speed = 1; 
            setTimeout(() => {
                actor.speed = normalSpeed; 
            }, this.duration)
        } else if ( x < 0.4)  {
            actor.speed = 8; 
            setTimeout(() => {
                actor.speed = normalSpeed; 
            }, this.duration)
        } else if ( x < 0.6)  {
            actor.radius = 40; 
            setTimeout(() => {
                actor.radius = normalRadius; 
            }, this.duration)
        } else if ( x < 0.8)  {
            actor.radius = 20; 
            setTimeout(() => {
                actor.radius = normalRadius; 
            }, this.duration)
        } else if ( x < 0.9)  {
            let actualPos = actor.position; 
            while (true) {
                let x = randintrange(0 + this.stage.paddingWidth + 200, this.stage.width - this.stage.paddingWidth - 200), 
                y = randintrange(0 + this.stage.paddingHeight + 200, this.stage.height - this.stage.paddingHeight - 200); 
                actor.position = new Pair(x, y)
                if (this.stage.getActor(actor)) {
                    actor.position = actualPos;
                } else {
                    break; 
                }
            }
        }  else if ( x <= 1)  {
            actor.health += 100 - actor.health; 
        }  
    }

    draw (context) {
        let size = this.health * this.sizeMultiplier; 
        context.beginPath();
		context.fillStyle = 'black';
		context.fillRect(this.position.x, this.position.y, size, size); 
        context.fill();   

        context.beginPath();
        context.fillStyle = canUse ? "green":"red";
        let fontSize = size/2; 
        context.font = `${fontSize}px MobFont`
        context.fillText('??', this.position.x + (size/2), this.position.y + (size/2))
        context.fill();

    }

}