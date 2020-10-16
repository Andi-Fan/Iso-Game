// General Gun Class
class Gun {
	constructor(stage, playerFired, bulletSpeed, bulletSize, capacity, magazine, magazineCapactity, damage, color, coolDown, deleteTime, reloadTime) {
		this.stage = stage;
		this.playerFired = playerFired; 
		this.bulletSpeed = bulletSpeed; 
		this.bulletSize = bulletSize; 
		this.capacity = capacity;
		this.magazine = magazine;
		this.magazineCapactity = magazineCapactity; 
		this.damage = damage;
		this.color = color;
		this.coolDown = coolDown; 
		this.deleteTime = deleteTime;
		this.reloadTime = reloadTime; 
		this.canShoot = true; 
		this.isReloading; 
	}

    // Start timer for when player can fire again
	resetCoolDown() {
		setTimeout(() => {
			this.canShoot = true;
		}, this.coolDown);
	}

    // Start a timer to delete the bullet 
	startDeleteTime(bullet) {
		setTimeout((bullet) => {
			this.stage.removeActor(bullet);
		}, this.deleteTime, bullet);
	}

    // Add ammo to gun 
	addAmmo(amount){
		this.capacity += amount; 
	}

    // Reload gun based on reload time 
	reload() {
		if (!this.isReloading) {
			this.isReloading  = setInterval(() => {
				if (this.capacity > 0 && this.magazine < this.magazineCapactity) {
					this.magazine++;
					this.capacity--;
				}
			}, this.reloadTime); 
			setTimeout(() => {
				clearInterval(this.isReloading);
				this.isReloading = undefined;
			}, this.reloadTime*(this.magazineCapactity - this.magazine + 1)); 
		}
	}
}

class RegularGun extends Gun {
	constructor(stage, actor) {
		super(stage, actor, 15, 7, 50, 10, 10, 10, 'rgba('+0+','+255+','+125+','+1+')', 500, 1000, 500)
	}

    // Fire regular gun
	shoot(player_cord, player_face) {
		if (this.isReloading) { return; }
		if (this.canShoot && this.magazine > 0) {
            let randx = 0, randy = 0;
            //Add slight spread for regular gun
			if (rand(1) <= 0.15) { randx = randintrange(-Math.sign(player_cord.x)*10, Math.sign(player_cord.x)*10); }
			if (rand(1) <= 0.15) { randy = randintrange(-Math.sign(player_cord.y)*10, Math.sign(player_cord.y)*10);  }
			var direction = new Pair(
				player_face.x + randx, 
				player_face.y + randy
				);
			direction.normalize(); 
			direction.x *= this.bulletSpeed;
			direction.y *= this.bulletSpeed;
			var position = new Pair(player_cord.x + player_face.x, player_cord.y + player_face.y);
			var bullet = new Bullet(this.stage, this.playerFired, position, direction, this.damage, this.color, this.bulletSize);
			this.stage.addActor(bullet);
			this.magazine--;
			this.canShoot = false; 
			this.resetCoolDown();
			this.startDeleteTime(bullet); 
		}
	}
}


class MachineGun extends Gun {
	constructor(stage, actor) {
		super(stage, actor, 20, 5, 120, 30, 30, 5, 'rgba('+255+','+255+','+125+','+1+')', 100, 1000, 250)
	}

    // Fire machine gun
	shoot(player_cord, player_face) {
		if (this.isReloading) { return; }
		if (this.canShoot && this.magazine > 0) {
            let randx = 0, randy = 0;
            // Add some spread
			if (rand(1) <= 0.30) { randx = randintrange(-Math.sign(player_cord.x)*10, Math.sign(player_cord.x)*10); }
			if (rand(1) <= 0.30) { randy = randintrange(-Math.sign(player_cord.y)*10, Math.sign(player_cord.y)*10);  }
			var direction = new Pair(
				player_face.x + randx, 
				player_face.y + randy
				);
			direction.normalize(); 
			direction.x *= this.bulletSpeed;
			direction.y *= this.bulletSpeed;
			var position = new Pair(player_cord.x + player_face.x, player_cord.y + player_face.y);
			var bullet = new Bullet(this.stage, this.playerFired, position, direction, this.damage, this.color, this.bulletSize);
			this.stage.addActor(bullet);
			this.magazine--;
			this.canShoot = false; 
			this.resetCoolDown();
			this.startDeleteTime(bullet); 
		}
	}
}


class ShotGun extends Gun {
	constructor(stage, actor) {
		super(stage, actor, 10, 5, 30, 5, 5, 12, 'rgba('+0+','+0+','+125+','+1+')', 500, 500, 750)
		this.fireAtOnce = 0; 
	}

    // Fire shotgun
	shoot(player_cord, player_face) {
        if (this.isReloading) { return; }
        
        // Fire the entire magazine at once 
		while (this.fireAtOnce > 0 && this.magazine > 0) {
            let randx = 0, randy = 0; 
            // Add spread
			if (rand(1) <= 0.75) { randx = randintrange(-Math.sign(player_cord.x)*20, Math.sign(player_cord.x)*20); }
			if (rand(1) <= 0.75) { randy = randintrange(-Math.sign(player_cord.y)*20, Math.sign(player_cord.y)*20);  }
			var direction = new Pair(player_face.x + randx, player_face.y + randy);
			direction.normalize(); 
			direction.x *= this.bulletSpeed;
			direction.y *= this.bulletSpeed;
			var position = new Pair(player_cord.x + player_face.x, player_cord.y + player_face.y);
			var bullet = new Bullet(this.stage, this.playerFired, position, direction, this.damage, this.color, this.bulletSize);
			this.stage.addActor(bullet);
			this.startDeleteTime(bullet); 
			this.magazine--;
			this.fireAtOnce--; 
        }

        // Fire once of cooldown
		if (this.canShoot) {
			this.fireAtOnce = this.magazine; 
			this.canShoot = false; 
			this.resetCoolDown();
		}
	}
}


class GrapplingHook extends Gun {
	constructor(stage, actor) {
		super(stage, actor, 25, 5, 5, 1, 1, 0, 'rgba('+125+','+125+','+255+','+1+')', 3000, 2000, 500)
	}

    // Fire grappling hook
	shoot(player_cord, player_face) {
		if (this.isReloading) { return; }
		if (this.canShoot && this.magazine > 0) {
			var direction = new Pair(player_face.x, player_face.y);
			direction.normalize(); 
			var position = new Pair(player_cord.x + player_face.x, player_cord.y + player_face.y);
			var hook = new Hook(this.stage, this.playerFired, position, direction, this.bulletSpeed, this.color);
			this.stage.addActor(hook);
			this.magazine--;
			this.canShoot = false; 
			this.resetCoolDown();
			this.startDeleteTime(hook); 
		}
	}
}

class GrenadeLauncher extends Gun {
	constructor(stage, actor) {
		super(stage, actor, 15, 5, 10, 5, 5, 40, 'rgba('+125+','+255+','+255+','+1+')', 2000, 750, 2000);
	}

	//Fire Grenade launcher 
	shoot(player_cord, player_face) {
		if (this.isReloading) { return; }
		if (this.canShoot && this.magazine > 0) {
			var direction = new Pair(player_face.x, player_face.y);
			direction.normalize(); 
			direction.x *= this.bulletSpeed;
			direction.y *= this.bulletSpeed;
			var position = new Pair(player_cord.x + player_face.x, player_cord.y + player_face.y);
			var grenade = new Grenade(this.stage, this.playerFired, position, direction, this.bulletSpeed, this.color);
			this.stage.addActor(grenade);
			this.magazine--;
			this.canShoot = false; 
			this.resetCoolDown();
			grenade.detonate(); 
		}
	}
}