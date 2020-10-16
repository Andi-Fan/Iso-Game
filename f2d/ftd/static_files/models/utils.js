// Coords 
class Pair {
	constructor(x,y){
		this.x=x; this.y=y;
	}

	// Magnitude of vector
	magnitude() {
		return Math.sqrt(this.x*this.x+this.y*this.y);
	}

	// Get oppsite vector
	oppsiteDirection() {
		var magnitude=this.magnitude(); 
		if (magnitude === 0) magnitude = 1; 
		let u = -1/magnitude;
		return new Pair(this.x*u, this.y*u)
	}

	// Turn into unit vector
	normalize(){
		var magnitude=this.magnitude(); 
		if (magnitude === 0) magnitude = 1; 
		this.x=this.x/magnitude;
		this.y=this.y/magnitude;
	}

}

// Single random number integer 
function randint(n){ return Math.round(Math.random()*n); }

// Get random numbers between a certain min max range 
function randintrange(num1, num2) { 
	let tempLower  = num1,
	tempUpper = num2 
	let upper = Math.min(num1, num2);
	let lower = Math.max(tempLower, tempUpper); 
    return Math.round(Math.random() * (upper - lower) + lower)}

// Get a single random number betweem 0 and n
function rand(n){ return Math.random()*n; }

// CIrcle on circle collision
function circleCircleCollision(curCicle, checkCircle, searchRadius=1, searchRadiusTwo=1) {
	return Math.pow((curCicle.position.x - checkCircle.position.x), 2) + 
	Math.pow((curCicle.position.y - checkCircle.position.y), 2) <= 
	Math.pow((curCicle.radius*searchRadius + checkCircle.radius*searchRadiusTwo), 2)
}

// Check if point is in circle
function pointCircleCollision(x, y, checkCircle, sizeMultiplier=1) {
	return Math.sqrt(Math.pow((x - checkCircle.position.x), 2) + 
	Math.pow((y - checkCircle.position.y), 2)) < checkCircle.radius*sizeMultiplier
}

// circle and rectangle collision check
function rectCircleCollision(circle, rect, sizeMultiplier=1) {
	var length = rect.health*rect.sizeMultiplier
    distanceX = Math.abs(circle.position.x - (rect.position.x + length/2));
    distanceY = Math.abs(circle.position.y - (rect.position.y + length/2));
    if (distanceX > length/2 + circle.radius*sizeMultiplier) return false;
    if (distanceY > length/2 + circle.radius*sizeMultiplier) return false;

    if (distanceX <= length/2) { return true; } 
    if (distanceY <= length/2) { return true; }

    cornerDistance_sq = Math.pow((distanceX - length/ 2), 2) +
                        Math.pow((distanceY - length/ 2), 2);

    return (cornerDistance_sq <= Math.pow(circle.radius*sizeMultiplier, 2));
}

// Rectangle on rectangle collision check 
function rectRectCollision(rectOne, rectTwo) {
	var sizeOne = rectOne.health*rectOne.sizeMultiplier; 
	var sizeTwo = rectTwo.health*rectTwo.sizeMultiplier; 
    if (rectOne.position.x < rectTwo.position.x + sizeTwo &&
        rectOne.position.x + sizeOne > rectTwo.position.x &&
        rectOne.position.y < rectTwo.position.y + sizeTwo &&
        rectOne.position.y + sizeOne > rectTwo.position.y) 
        return true
     return false
}

/** 
 * SRC: http://www.jeffreythompson.org/collision-detection/table_of_contents.php
 * Used this reference for line based collisions
*/

// Check if 2 lines intersect 
function lineLineCollision(pos1Start, pos1End, pos2Start, pos2End) {
	let lineOne = ((pos2End.x-pos2Start.x)*(pos1Start.y-pos2Start.y) - (pos2End.y-pos2Start.y)*(pos1Start.x-pos2Start.x)) / 
	((pos2End.y-pos2Start.y)*(pos1End.x-pos1Start.x) - (pos2End.x-pos2Start.x)*(pos1End.y-pos1Start.y)),
	lineTwo = ((pos1End.x-pos1Start.x)*(pos1Start.y-pos2Start.y) - (pos1End.y-pos1Start.y)*(pos1Start.x-pos2Start.x)) / 
	((pos2End.y-pos2Start.y)*(pos1End.x-pos1Start.x) - (pos2End.x-pos2Start.x)*(pos1End.y-pos1Start.y));
	if (lineOne >= 0 && lineOne <= 1 && lineTwo >= 0 && lineTwo <= 1) {
		return true;
	}
	return false;
}

// Check if a line and point collide 
function linePointCollision(pos1Start, pos1End, pos2) {
	let linemag = dist(pos1Start, pos1End),
	d1 = dist(pos2, pos1Start), 
	d2 = dist(pos2, pos1End),
	leeway = 1; 
	if (d1+d2 >= leeway && d1+d2 <= linemag+leeway) {
		return true;
	}
	return false;
}

// Check line circle collision
function lineCircleCollision(pos1Start, pos1End, circle, sizeMultiplier=1) {
	if (pointCircleCollision(pos1Start.x, pos1Start.y, circle, sizeMultiplier) ||
	pointCircleCollision(pos1End.x, pos1End.y, circle, sizeMultiplier)) {
		return true; 
	}

	let closestPoint = new Pair(pos1Start.x - pos1End.x, pos1Start.y - pos1End.y),
	magnitude = closestPoint.magnitude(),
	dot = (((circle.position.x - pos1Start.x)*(pos1End.x - pos1Start.x)) +
	 ((circle.position.y - pos1Start.y) * (pos1End.y - pos1Start.y)) ) / Math.pow(magnitude,2);

	closestPoint.x = pos1Start.x + (dot * (pos1End.x - pos1Start.x));
	closestPoint.y = pos1Start.y + (dot * (pos1End.y - pos1Start.y));

	let onSegment = linePointCollision(pos1Start, pos1End, closestPoint);
	if (!onSegment) return false;

	let distance = new Pair(closestPoint.x - circle.position.x, closestPoint.y - circle.position.y),
	dist_mag = distance.magnitude();
	return dist_mag <= circle.radius * sizeMultiplier; 
}

// Check if line intersects rectangle
function lineRectCollision(pos1Start, pos1End, rect) {
	let size = rect.health * rect.sizeMultiplier
	let left = lineLineCollision(pos1Start,pos1End, new Pair(rect.position.x, rect.position.y),            new Pair(rect.position.x, rect.position.y + size)),
	right=     lineLineCollision(pos1Start,pos1End, new Pair(rect.position.x + size, rect.position.y), new Pair(rect.position.x + size, rect.position.y + size)),
	top =      lineLineCollision(pos1Start,pos1End, new Pair(rect.position.x, rect.position.y),             new Pair(rect.position.x + size, rect.position.y)),
	bottom =   lineLineCollision(pos1Start,pos1End, new Pair(rect.position.x, rect.position.y + size), new Pair(rect.position.x + size, rect.position.y + size));
	if (left || right || top || bottom) return true;
	return false;
}  	


// Pick a weapon item to spawn
function returnRandomItem(stage, actor) {
	let random = rand(1);
	if (random < 0.1)
		return new GrapplingHook(stage, actor)
	else if (random < 0.3)
		return new ShotGun(stage, actor)
	else if (random < 0.5)
		return new MachineGun(stage, actor)
	else if (random < 0.65)
		return new GrenadeLauncher(stage, actor)
	else
		return new RegularGun(stage, actor)
}

const dist = (p1, p2) => {
	return Math.sqrt( Math.pow(p1.x - p2.x ,2) + Math.pow(p1.y - p2.y ,2))
}