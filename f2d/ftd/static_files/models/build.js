class Build {
    constructor(stage, position) {
        this.stage = stage;
        this.pos1 = position;
        this.pos2; 
        this.doneBuilding = false; 
        this.health = 50; 
        this.id = "BUILD";
    }

    finishBuild(dx, dy) {
        this.pos2 = new Pair(dx, dy)
        
        // If we are done building, lets check to see if the placing is valid 
        let check = this.stage.getActor(this)

        //Building is valid add it 
        if (!check) {
            this.doneBuilding = true; 
            this.stage.addActor(this); 
            this.deleteTimer()
        }
    }

    collide(actor) {
        // If building collides with anything it is invalid 
        switch (actor.id) {
            case "BULLET":
                actor.collide(this); 
                break
        }
        return; 
    }

    contains(actor) {
        switch(actor.id) {
            case "ENEMY":
            case "PLAYER":
                return lineCircleCollision(this.pos1, this.pos2, actor);
            case "MYSTERYFLOOR":
            case "CRATE":
                return lineRectCollision(this.pos1, this.pos2, actor);
            case "BARREL":
                return lineCircleCollision(this.pos1, this.pos2, actor, actor.sizeMultiplier)
            case "BUILD" :
                return lineLineCollision(this.pos1, this.pos2, actor.pos1, actor.pos2)
            case "BULLET" :
                return lineCircleCollision(this.pos1, this.pos2, actor);
        }
    }

    step() {
        if (!this.doneBuilding) return; 
        if (this.health <= 0) {
            this.stage.removeActor(this)
        }
        this.stage.isColliding(this);
    }

    deleteTimer() {
        setTimeout(() => {
            this.stage.removeActor(this); 
        }, 8000)
    }

    draw(context) {
        context.beginPath();
        context.lineWidth = 10; 
        context.strokeStyle = "Black";
        context.moveTo(this.pos1.x, this.pos1.y);
        context.lineTo(this.pos2.x, this.pos2.y);
        context.stroke();
    }
}