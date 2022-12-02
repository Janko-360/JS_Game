/*
This is my game project 2.2 for Introduction to Programming 1. 

The basic structure and game mechanics I based on the example from our Lecturers. 
- I added a 3-level system with respawn or restart features after death, winning or losing. 
  I also added sound, platforms and enemies, according to the levels.  
- Based on the particle system, I added moving hover-rings that adjust in position as the character 
  moves about. 
- Then I added a high score log with player named scores. The log shows the 4 best runs and the last run.  

This game project was a fun learning journey as I used my basic knowledge from Python and build on it the 
object orientated approach. OOP was the thing I did not understand how or even why to use. After this project it
all makes sense and I wish to rewrite the game fundamentally so I can add new features more easily. In general,
this was one of those fun projects where I can spend way too much time than I should. Learning, 
exploring the documentation, building and programming.

Tip: For a easier playthrough and testing of mechanics, comment out 'return true;' in the factory pattern for 
'Enemy.checkContact' . This will help with winning and testing the high score logging. 

*/

// Declare all variables 
var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var trees_x;
var collectables;
var canyons;
var clouds;
var mountains;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;

var game_score;
var flagpole;
var lives;
var level;

var jumpSound;
var hoverSound;
var collectSound;
var levelCompleteSound;
var normalDeath;
var robotDeath;

var platforms; 

var enemies;
var enemy1;
var enemy2;

var emit;

var isLoggingScore;
var scoreLog;
var isTyping;
var typedText;

function preload()
{
    soundFormats('mp3','wav');
    
    //load sounds
    jumpSound = loadSound('assets/sounds/jump.wav');
    jumpSound.setVolume(0.2);

    collectSound = loadSound('assets/sounds/collection.wav');
    collectSound.setVolume(0.3);

    levelCompleteSound = loadSound('assets/sounds/confirmation.wav');
	levelCompleteSound.setVolume(1);

	robotDeath = loadSound('assets/sounds/death_by_robot.wav');
	robotDeath.setVolume(0.2)

	normalDeath = loadSound('assets/sounds/die.wav');

	hoverSound = loadSound('assets/sounds/hover.wav');
	hoverSound.setVolume(0.1)
	
	//load images
	enemy1 = loadImage("assets/images/enemy1.png");
	enemy2 = loadImage("assets/images/enemy2.png");

	 //load font
	pastiFont = loadFont('assets/other/PastiRegular-mLXnm.otf');
}

function setup()
{
    createCanvas(1024, 576);
    
	floorPos_y = height * 3/4;
	
	//setting the angle mode to DEGREES
	angleMode(DEGREES);
	
	//setting up the values for the game start. 
	lives = 3;
	level = 1;
	game_score = 0;

	// setting up for logging of high scores 
	isLoggingScore = false;
	isTyping = false;
	scoreLog = [];
    typedText = '';

	//Start the first round
	startGame(lives, level, game_score);
}

function draw()
{ 
	background(100, 155, 255);

	noStroke();
	fill(0,155,0);
	rect(0, floorPos_y, width, height/4);

	//push for the scroling of the background and the character stays on screen 
	push();
	translate(scrollPos, 0);

	// Draw the scenery 
	drawClouds()
	drawMountains()
	drawTrees();
	for (var i = 0; i < canyons.length; i++)
	{
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i])
	}

	// Draw collectable items.
	for (var i = 0; i < collectables.length; i++)
	{
		if (collectables[i].isFound == false)
		{
			drawCollectable(collectables[i])
			checkCollectable(collectables[i])
		}
	}

	//Draw all the platforms 
	for(var i = 0; i < platforms.length; i++)
	{
		platforms[i].draw();
	}

	//Call the falgpole render function 
	renderFlagpole();

	//Enemy darwing and checking if they kill us
	renderEnemies();
	
	pop();
	

	// Display the right message after death or level completion 
	finishMessages();
	
	// Render both score boxes
	renderScoreBoxes();

	//Check and render the log score message and text box
	checkLoggingScore();
	
	// Draw game character.
	drawGameChar();

	//Update the hover rings
	emit.updateRings(gameChar_x, gameChar_y);

	//See if the player falls to his death
	checkPlayerDie()


	// Movement, scroll, falling, platform and flagpole logic!!!
	coreLogic();

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;
}

function mousePressed()
{
  // Collision detection with the text box
  if((mouseX <= 557 && mouseX >= 457) &&
  (mouseY >=282 && mouseY <=307) && isLoggingScore)
  {
    isTyping = true;
  }
  else
  {
    isTyping =false;
  }
}

// Key control and restart logic, after perssing ENTER.
function keyPressed()
{
	if(!isLoggingScore)
	{
		// ignore all ohter keys if we are dead or finished, only resond to enter
		if(lives == 0)
		{
			if(keyCode == 13)
			{
				startGame(3, 1, 0);
			}
		} 
		else if(flagpole.isReached)
		{
			if(level == 3 && keyCode == 13)
			{
				flagpole.isReached = false;
				logScore(game_score);
			}
			else if(keyCode == 13)
			{
				level += 1;
				startGame(lives, level, game_score);
			}
		}
		else if(lives > 0)
		{
			// resond to the arrow keys if the game runs
			if(keyCode == 37)
			{
				isLeft = true 
			}
			if (keyCode == 39)
			{
				isRight = true 
			}																
			if (keyCode == 38 && (gameChar_y == floorPos_y ||
				(gameChar_y > 345 && gameChar_y <= 350) ||
				(gameChar_y > 265 && gameChar_y <= 270)))
			{
				jumpSound.play(0,1, 0.2, 0, 2);
				gameChar_y -= 100
			}
		}
	}
	else if(isLoggingScore)
	{
		// Proccess the type of key pressed, only if we ckiled in the text box
		if(isTyping)
		{
		  if(keyCode == 13 && typedText == '')
		  {
			return
		  }
		  else if(keyCode == 13 && !typedText == '')
		  {
			scoreLog.push({name: typedText, score: game_score, index: scoreLog.length})
			typedText = '';
			isTyping = false;
			startGame(3, 1, 0);
		  }
		  else if(keyCode == 8)
		  {
			typedText = typedText.slice(0, -1);
		  }
		  else if(typedText.length<10)
		  {
			typedText += key;
		  }
		}
	}
	
}

function keyReleased()
{
	if(keyCode == 37)
	{
		isLeft = false 
	}
	if (keyCode == 39)
	{
		isRight = false 
	}
}

function coreLogic()
{
		// Logic to make the game character move and background scroll.
		if(isLeft)
		{
			if(gameChar_x > width * 0.2)
			{
				gameChar_x -= 5;
			}
			else
			{
				scrollPos += 5;
			}
		}
	
		if(isRight)
		{
			if(gameChar_x < width * 0.8)
			{
				gameChar_x  += 5;
			}
			else
			{
				scrollPos -= 5;
			}
		}
	
		// Logic to make the game character rise and fall. And setting all the movement states. 
		if (gameChar_y < floorPos_y)
		{
			var isOnPlatform = false;
	
			for(var i = 0; i < platforms.length; i++)
			{
				if(platforms[i].checkContact(gameChar_world_x, gameChar_y))
				{
					isOnPlatform = true;
					break;
				}
			}
	
			if(isOnPlatform)
			{
				isFalling = false;
			}
	
			else if(isOnPlatform == false)
			{
				isFalling = true;
				gameChar_y += 1;
			}
	
		}
		else 
		{
			isFalling = false
		}
	
		//Check flagpole call
		if (flagpole.isReached == false)
		{
			checkFlagpole();
		}
}

function renderEnemies()
{
	for(var i = 0; i < enemies.length; i++)
	{
		enemies[i].draw();

		var isContact = enemies[i].checkContact(gameChar_world_x, gameChar_y);

		if(isContact)
		{
			if(lives > 0)
			{
				hoverSound.stop();
				robotDeath.play(0, 1, 0.5, 0, 0.6); 
				lives -= 1;
				startGame(lives, level, 0);
				break;
			}
		}
	}
}

function finishMessages()
{
	if (lives==0)
	{
		push();
		fill(50, 50, 250, 150);
		stroke(0);
		rect(512 - 130, 245, 230, 100, 5);
		noStroke();
		fill(0);
		textSize(30);
		textFont(pastiFont);
		text('Game over', 512 - 80, height/2);
		textSize(15);
		text('Press Enter to restart', 512 - 93, height/2 + 35);
		pop();
	}
	else if(flagpole.isReached && level == 3)
	{
		hoverSound.stop()
		push();
		fill(50, 50, 250, 150);
		stroke(250);
		rect(512 - 118, 245, 230, 100, 5);
		fill(250);
		noStroke();
		textSize(30);
		textFont(pastiFont);
		text('Game won!', 512 - 70, height/2);
		textSize(15);
		text('Press Enter to save your score', 512 - 105, height/2 + 35);
		pop();
	}
	else if(flagpole.isReached)
	{
		hoverSound.stop()
		push();
		fill(50, 50, 250, 150);
		stroke(0, 0, 255);
		rect(512 - 120, 245, 230, 100, 5);
		fill(0);
		noStroke();
		textSize(30);
		textFont(pastiFont);
		text('Level complete', 512 - 100, height/2);
		textSize(15);
		text('Press enter to continue', 512 - 85, height/2 + 35);
		pop();
	}
}

function renderScoreBoxes()
{
	//Right score Box
	fill(0, 0, 150, 150);
	stroke(0, 0, 255);
	rect(927, 5, 90, 170, 5);
	fill(255)
	text('High score', 937, 25)
	if(scoreLog.length == 0)
	{
		text('- : -', 937, 48)
	}
	else
	{
		scoreLog.sort((a, b) => b.score - a.score);
		for(var i = 0; i < scoreLog.length; i++)
		{
		if(i<4)
			{
			textSize(12);
			text(scoreLog[i].name + ': '+scoreLog[i].score, 937 , 48+i*20)
			}
		}
	}
	textSize(15);
	text('Last score:', 937, 140);
	if(scoreLog.length == 0)
	{
		text('- : -', 937, 160)
	}
	else
	{
		for(var i = 0; i < scoreLog.length; i++)
		{
		if(scoreLog[i].index==scoreLog.length-1)
			{
			textSize(12);
			text(scoreLog[i].name + ': '+scoreLog[i].score, 937, 160)
			}
		}
	}


	// Left score Box
	fill(0, 0, 150, 150);
	stroke(0, 0, 255);
	rect(5, 3, 170, 90, 5);

	noStroke();
	textSize(15);
	textFont(pastiFont);
	fill(255);
	text('Score: ' + game_score, 20, 20);

	text('Lives: ', 20, 50);
	for (var i = 0; i < lives; i++)
	{
		var x = 80 + (i*35)
		var y = 45
		fill(255, 0, 0)
		ellipse(x-6, y-5, 15)
		ellipse(x+6, y-5, 15)
		triangle(x-13, y-2, x+13, y-2, x, y+12)
	}
	fill(255);
	text('Level: ' + level, 20, 80);
}

function checkLoggingScore()
{
	// Only show the log box if we finished and can save the score with a name
	if(isLoggingScore)
	{
		push();
		fill(50, 50, 250, 150);
		stroke(0, 0, 255);
		rect(392, 220, 230, 135, 5);
		fill(150);
		noStroke();
		rect(457, 282, 100, 25)
		fill(250);
		noStroke();
		textSize(20);
		textFont(pastiFont);
		text('Name your score', 432, height/2 -25);
		textSize(10);
		text('Press enter to save and paly again', 512 - 85, height/2 + 39);
	
		// display the typed text in the text field under the right condition
		if(typedText != '')
		{
			fill(255)
			textSize(15);
			text(typedText, 512-42, 300)
		}
		else if(isTyping)
		{
			text('', 305, 215)
		}
		else
		{
			push();
			fill(255)
			textSize(12);
			text('Enter a name',512-38, 300)
			pop();
		}
		pop();
	}
}

function logScore(score)
{
	// Set the logging screen and state so we can save the name with the score.
	isLoggingScore = true;
	flagpole.isReached = false;
	level = 1;
	
	background(100, 155, 255);
	enemies = [];
	platforms = [];
	collectables = [];
	gameChar_x = width/2;
	gameChar_y = floorPos_y;
	scrollPos = 0;
}

// Game character render function
function drawGameChar()
{
	if(isLeft && isFalling)
	{
		push();
		rotate(-20);
		strokeWeight(1)
		fill(255);
		stroke(0, 0, 200);

		ellipse((gameChar_x+10)*cos(-20) + (gameChar_y-40)*sin(-20), 
		(gameChar_y-40)*cos(-20) - (gameChar_x+10)*sin(-20), 22, 40);   // body

		ellipse((gameChar_x-2)*cos(-20) + (gameChar_y-67)*sin(-20), 
		(gameChar_y-67)*cos(-20) - (gameChar_x-2)*sin(-20), 20, 15);	// head

		noFill();
		stroke(0, 140, 255);
		rotate(-20);
		fill(255);
		stroke(0, 0, 200);
		ellipse((gameChar_x-5)*cos(-40) + (gameChar_y-50)*sin(-40), 
		(gameChar_y-50)*cos(-40) - (gameChar_x-5)*sin(-40), 7, 15);	// arms
		strokeWeight(3);
		point((gameChar_x-9)*cos(-40) + (gameChar_y-68)*sin(-40), 
		(gameChar_y-68)*cos(-40) - (gameChar_x-9)*sin(-40));
		pop();
	}
	else if(isRight && isFalling)
	{
		push();
		rotate(20);
		strokeWeight(1);
		fill(255);
		stroke(0, 0, 200);

		ellipse((gameChar_x - 10)*cos(-20) - (gameChar_y - 40)*sin(-20), 
		(gameChar_y - 40)*cos(-20) + (gameChar_x - 10)*sin(-20), 22, 40);   // body

		ellipse((gameChar_x)*cos(-20) - (gameChar_y - 70)*sin(-20), 
		(gameChar_y - 70)*cos(-20) + (gameChar_x)*sin(-20), 20, 15);	// head

		stroke(0, 140, 255);
		noFill()
		rotate(20);
		fill(225)
		stroke(0, 0, 200);
		ellipse((gameChar_x+5)*cos(-40) - (gameChar_y-50)*sin(-40), (gameChar_y-50)*cos(-40) + (gameChar_x+5)*sin(-40), 7, 15);	// arms
		strokeWeight(3);
		point((gameChar_x+7)*cos(-40) - (gameChar_y-70)*sin(-40), (gameChar_y-70)*cos(-40) + (gameChar_x+7)*sin(-40));
		pop();
	}
	else if(isLeft)
	{
		push();
		rotate(-20);
		strokeWeight(1);
		fill(255);
		stroke(0, 0, 200);
		ellipse((gameChar_x+10)*cos(-20) + (gameChar_y-40)*sin(-20), (gameChar_y-40)*cos(-20) - (gameChar_x+10)*sin(-20), 22, 40);   // body
		ellipse((gameChar_x)*cos(-20) + (gameChar_y-63)*sin(-20), (gameChar_y-63)*cos(-20) - (gameChar_x)*sin(-20), 20, 15);	// head
		stroke(0, 140, 255);
		noFill();
		rotate(-70);
		stroke(0, 0, 200);
		fill(255);
		ellipse((gameChar_x-3)*cos(-90) + (gameChar_y-45)*sin(-90), (gameChar_y-45)*cos(-90) - (gameChar_x-3)*sin(-90), 7, 15);	// arms
		strokeWeight(3);
		point((gameChar_x-7)*cos(-90) + (gameChar_y-62)*sin(-90), (gameChar_y-62)*cos(-90) - (gameChar_x-7)*sin(-90));
		pop();
	}
	else if(isRight)
	{
		push();
		rotate(20);
		strokeWeight(1);
		fill(255);
		stroke(0, 0, 200);
		ellipse((gameChar_x-10)*cos(-20) - (gameChar_y-40)*sin(-20), (gameChar_y-40)*cos(-20) + (gameChar_x-10)*sin(-20), 22, 40);   // body
		ellipse((gameChar_x-0)*cos(-20) - (gameChar_y-65)*sin(-20), (gameChar_y-65)*cos(-20) + (gameChar_x-0)*sin(-20), 20, 15);	// head
		noFill();
		stroke(0, 140, 255);
		rotate(70);
		stroke(0, 0, 200)
		fill(255);
		ellipse((gameChar_x)*cos(-90) - (gameChar_y-45)*sin(-90), (gameChar_y-45)*cos(-90) + (gameChar_x)*sin(-90), 7, 15);	// arms
		strokeWeight(3);
		point((gameChar_x+5)*cos(-90) - (gameChar_y-63)*sin(-90), (gameChar_y-63)*cos(-90) + (gameChar_x+6)*sin(-90));
		pop();
	}
	else if(isFalling || isPlummeting)
	{
		fill(255);
		strokeWeight(1);
		stroke(0, 0, 200);
		ellipse(gameChar_x, gameChar_y - 50, 22, 40);   // body
		ellipse(gameChar_x - 12, gameChar_y - 60, 7, 15);	// arms R
		ellipse(gameChar_x + 12, gameChar_y - 60, 7, 15);	// arms L
		ellipse(gameChar_x, gameChar_y - 70, 20, 15);	// head
		strokeWeight(3);
		point(gameChar_x -5, gameChar_y - 70);
		point(gameChar_x +5, gameChar_y - 70);
		strokeWeight(1);
		stroke(0, 140, 255);
		noFill();
	}
	else
	{
		fill(255);
		stroke(0, 0, 200);
		strokeWeight(1);
		ellipse(gameChar_x, gameChar_y - 40, 22, 40);   // body
		ellipse(gameChar_x - 10, gameChar_y - 42, 7, 15);	// arms L
		ellipse(gameChar_x + 10, gameChar_y - 42, 7, 15);	// arms R
		ellipse(gameChar_x, gameChar_y - 60, 20, 15);	// head
		strokeWeight(3);
		point(gameChar_x -5, gameChar_y - 60);
		point(gameChar_x +5, gameChar_y - 60);
		strokeWeight(1);
		stroke(0, 140, 255);
		noFill();
	}
}

// Background render functions
function drawClouds()
{
	// render all clouds
	for(var i = 0; i < clouds.length; i++)
	{
		clouds[i].size = max(clouds[i].size, 35);
		fill(100, 155, 255);
		stroke(0, 0, 200);
		ellipse(clouds[i].x_pos, clouds[i].y_pos, clouds[i].size + 25, clouds[i].size);
		ellipse(clouds[i].x_pos + 10, clouds[i].y_pos -20, clouds[i].size, clouds[i].size - 20);
		ellipse(clouds[i].x_pos + 30, clouds[i].y_pos, clouds[i].size, clouds[i].size - 10);
		noStroke();
		ellipse(clouds[i].x_pos + 15, clouds[i].y_pos + 5, clouds[i].size, clouds[i].size);
		ellipse(clouds[i].x_pos - 3, clouds[i].y_pos + 10, clouds[i].size, clouds[i].size - 10);
	}
}

function drawMountains()
{
	// render all mountains
	for (var i = 0; i < mountains.length; i++)
	{
		fill(100);
		triangle(
			mountains[i].x_pos, mountains[i].y_pos, 
			mountains[i].x_pos + 175, mountains[i].y_pos-330 + mountains[i].size, 
			mountains[i].x_pos + 400 - mountains[i].size, mountains[i].y_pos);
		fill(125);
		triangle(
			mountains[i].x_pos - 50, mountains[i].y_pos, 
			mountains[i].x_pos + 250, mountains[i].y_pos - 230 + mountains[i].size, 
			mountains[i].x_pos + 450 - mountains[i].size, mountains[i].y_pos);
		fill(150);
		triangle(
			mountains[i].x_pos - 50, mountains[i].y_pos, 
			mountains[i].x_pos + 90, mountains[i].y_pos - 280 + mountains[i].size, 
			mountains[i].x_pos + 300 - mountains[i].size, mountains[i].y_pos);
	}
}

function drawTrees()
{
	// render all trees
	for (var i = 0; i < trees_x.length; i++)
	{
		fill(200, 100, 0);
		noStroke();
		beginShape();
		vertex(trees_x[i], floorPos_y);
		vertex(trees_x[i]-10, floorPos_y - 148);
		vertex(trees_x[i] - 40 , floorPos_y - 148);
		vertex(trees_x[i] - 50, floorPos_y);
		endShape(CLOSE);
		fill(0, 200, 0);
		ellipse(trees_x[i], floorPos_y - 142, 150, 75);
		ellipse(trees_x[i] - 50, floorPos_y - 140, 150, 75); 
		ellipse(trees_x[i] - 30, floorPos_y - 170, 100, 75);
	}
}

// Canyon render and check functions
function drawCanyon(t_canyon)
{
	// render all the canyons
	fill(100, 155, 255)
	beginShape();
	vertex(t_canyon.x_pos, 432);
	vertex(t_canyon.x_pos, 450);
	vertex(t_canyon.x_pos -15, 480);
	vertex(t_canyon.x_pos - 8, 500);
	vertex(t_canyon.x_pos - 20, 520)
	vertex(t_canyon.x_pos - 40, 576);
	vertex(t_canyon.x_pos + t_canyon.width - 40, 576);
	vertex(t_canyon.x_pos + t_canyon.width - 30, 550);
	vertex(t_canyon.x_pos + t_canyon.width - 25, 500);
	vertex(t_canyon.x_pos + t_canyon.width - 30, 480);
	vertex(t_canyon.x_pos + t_canyon.width - 30, 432); 
	endShape(CLOSE);
	fill(203,66,0)
	beginShape();
	vertex(t_canyon.x_pos - 35, 576);
	vertex(t_canyon.x_pos - 30, 560);
	vertex(t_canyon.x_pos - 25, 560);
	vertex(t_canyon.x_pos - 20, 565);
	vertex(t_canyon.x_pos - 15, 576);
	endShape(CLOSE);
}

function checkCanyon(t_canyon)
{
	//Check if we are in the canyon
	if (gameChar_world_x > t_canyon.x_pos && gameChar_world_x < (t_canyon.x_pos + t_canyon.width - 30) 
	&& gameChar_y >= floorPos_y)
	{
        isPlummeting = true
		isRight = false
		isLeft = false
	}
	else
	{
		isPlummeting = false
	}

	if (isPlummeting == true)
	{
		gameChar_y += 3
	}
	
}

// Collectable items render and check functions
function drawCollectable(t_collectable)
{
	//Draw the Colectable 
	stroke(100);
	strokeWeight(1);
	fill(255);
	beginShape();
	// anchor it at the centre bottom for a vertical line of reflection
	vertex((t_collectable.x_pos-15), (t_collectable.y_pos));
	vertex((t_collectable.x_pos-20), (t_collectable.y_pos-5));
	vertex((t_collectable.x_pos-20), (t_collectable.y_pos-25));
	vertex((t_collectable.x_pos-15), (t_collectable.y_pos-30));
	vertex((t_collectable.x_pos+15), (t_collectable.y_pos-30));
	vertex((t_collectable.x_pos+20), (t_collectable.y_pos-25));
	vertex((t_collectable.x_pos+20), (t_collectable.y_pos-5));
	vertex((t_collectable.x_pos+15), (t_collectable.y_pos));
	endShape(close);

	stroke(50);
	strokeWeight(3);
	beginShape();
	vertex((t_collectable.x_pos-13), (t_collectable.y_pos));
	vertex((t_collectable.x_pos-15), (t_collectable.y_pos));
	vertex((t_collectable.x_pos-20), (t_collectable.y_pos-5));
	vertex((t_collectable.x_pos-20), (t_collectable.y_pos-7));
	endShape();

	stroke(50);
	strokeWeight(3);
	beginShape();
	vertex((t_collectable.x_pos-20), (t_collectable.y_pos-23));
	vertex((t_collectable.x_pos-20), (t_collectable.y_pos-25));
	vertex((t_collectable.x_pos-15), (t_collectable.y_pos-30));
	vertex((t_collectable.x_pos-13), (t_collectable.y_pos-30));
	endShape();

	stroke(50);
	strokeWeight(3);
	beginShape();
	vertex((t_collectable.x_pos+20), (t_collectable.y_pos-23));
	vertex((t_collectable.x_pos+20), (t_collectable.y_pos-25));
	vertex((t_collectable.x_pos+15), (t_collectable.y_pos-30));
	vertex((t_collectable.x_pos+13), (t_collectable.y_pos-30));
	endShape();

	stroke(50);
	strokeWeight(3);
	beginShape();
	vertex((t_collectable.x_pos+13), (t_collectable.y_pos));
	vertex((t_collectable.x_pos+15), (t_collectable.y_pos));
	vertex((t_collectable.x_pos+20), (t_collectable.y_pos-5));
	vertex((t_collectable.x_pos+20), (t_collectable.y_pos-7));
	endShape();

	stroke(0,0,200);
	strokeWeight(2)
	fill(20, 20, 255);
	beginShape();
	vertex((t_collectable.x_pos-8), (t_collectable.y_pos-5));
	vertex((t_collectable.x_pos-13), (t_collectable.y_pos-9));
	vertex((t_collectable.x_pos-13), (t_collectable.y_pos-18));
	vertex((t_collectable.x_pos-8), (t_collectable.y_pos-23));
	vertex((t_collectable.x_pos+8), (t_collectable.y_pos-23));
	vertex((t_collectable.x_pos+13), (t_collectable.y_pos-18));
	vertex((t_collectable.x_pos+13), (t_collectable.y_pos-9));
	vertex((t_collectable.x_pos+8), (t_collectable.y_pos-5));
	endShape(close);
}

function checkCollectable(t_collectable)
{
	//Check if we are close enough to collect it if we are, set isFound to true, for that piece, and increment game score
	if (dist(t_collectable.x_pos, t_collectable.y_pos, gameChar_world_x, gameChar_y) < 20)
	{
        t_collectable.isFound = true
        collectSound.play();
		game_score += 1;
	}
}

//Flag render and check functions
function renderFlagpole()
{
	// Flag and falgpole render with the if of isReached
	push();

	// Pole
	fill(230)
	strokeWeight(0);
	rect(flagpole.x_pos, flagpole.y_pos, 10, -180);
	triangle(flagpole.x_pos, flagpole.y_pos - 180, 
		flagpole.x_pos + 10, flagpole.y_pos - 180,
		flagpole.x_pos + 10, flagpole.y_pos -190);
	fill(180);
	rect(flagpole.x_pos - 8, flagpole.y_pos, 11, -60);
	triangle(flagpole.x_pos +3, flagpole.y_pos - 60,
		flagpole.x_pos - 8, flagpole.y_pos -60, 
		flagpole.x_pos + 3, flagpole.y_pos -90);

	//Flag if we reached it. 
	if(flagpole.isReached)
	{
		rect(flagpole.x_pos - 20, flagpole.y_pos - 175, 50, 3);
		fill(0, 0, 170)
		stroke(0)
		beginShape();
		vertex(flagpole.x_pos - 17, flagpole.y_pos - 173);
		vertex(flagpole.x_pos - 12, flagpole.y_pos - 100);
		vertex(flagpole.x_pos- 10, flagpole.y_pos -90);
		vertex(flagpole.x_pos, flagpole.y_pos -100);
		vertex(flagpole.x_pos + 4, flagpole.y_pos -80);
		vertex(flagpole.x_pos + 8, flagpole.y_pos -100);
		vertex(flagpole.x_pos +18, flagpole.y_pos - 90);
		vertex(flagpole.x_pos +20, flagpole.y_pos -100);
		vertex(flagpole.x_pos + 26, flagpole.y_pos -173);
		endShape(CLOSE);
	}

	pop();
}

function checkFlagpole()
{
	// Set the flagpole to raised if the character reaches it. 
	if (dist(gameChar_world_x, gameChar_y, flagpole.x_pos, flagpole.y_pos)<10)
	{
        levelCompleteSound.play()
		flagpole.isReached = true
	}
}

function checkPlayerDie()
{
	// Lives decrementing and respawn function when falling into the canyon. 
	if (gameChar_y > height)
	{
		lives -= 1;
		hoverSound.stop()
		normalDeath.play()
		if (lives >= 0)
		{
			startGame(lives, level, 0);
		}
	}
}

function createPlatforms(x, y, length)
{
	//Function that creates the paltform objects. They are stored in the platforms array. 
	var p = {
		platformX: x,
		platformY: y,
		platformLength: length,
		draw: function()
		{
			fill(255);
			noStroke();
			rect(this.platformX - this.platformLength, this.platformY, this.platformLength*2, 10)
			rect(this.platformX - this.platformLength - 5,this.platformY, 5, 5);
			rect(this.platformX + this.platformLength,this.platformY, 5, 5);
			triangle(this.platformX - this.platformLength - 5, this.platformY + 5,
					this.platformX - this.platformLength, this.platformY + 10,
					this.platformX - this.platformLength, this.platformY + 5);
			triangle(this.platformX + this.platformLength + 5, this.platformY + 5,
				this.platformX + this.platformLength, this.platformY + 10,
				this.platformX + this.platformLength, this.platformY + 5);
			fill(170);
			rect(this.platformX - this.platformLength*2/3, this.platformY, this.platformLength*4/3, 2)
		},

		checkContact: function(gameChar_x, gameChar_y)
		{
			if(gameChar_x < this.platformX + this.platformLength 
				&& gameChar_x > this.platformX - this.platformLength)
				{
					var d = this.platformY - gameChar_y;

					if(d >= 0 && d < 5)
					{
						return true;
					}
					return false;
				}
		}
	}

	return p;
}

function Enemy(x, y, range, type, speed)
{
	//The factory pattern for every enemy
	this.x = x; 
	this.y = y;
	this.range = range;
	this.type = type;

	this.currentX = x;
	this.speed = speed;
	this.inc = speed;

	this.update = function()
	{
		this.currentX += this.inc;
		
		if(this.currentX > this.x + this.range)
		{
			speed = round(random(1, this.speed))
			this.inc = -speed;
		}
		else if(this.currentX < this.x)
		{
			speed = round(random(1, this.speed))
			this.inc = speed;
		}
	}

	this.draw = function()
	{
		this.update();

		if(this.type == 1)
		{
			image(enemy1, this.currentX, this.y - 50, 100, 50);
		}
		else if(this.type == 2)
		{
			image(enemy2, this.currentX, this.y - 50, 100, 50);
		}
	}

	this.checkContact = function(charX, charY)
	{
		var d = dist(charX, charY, this.currentX + 50, this.y + 25);

		if(d < 50)
		{
			return true;
		}

		return false;
	}
}

//The hover ring particle system based on Constructor functions. 
function Ring(x, y, ySpeed)
{
	//The function that updates and draws all the rings 
	this.rDist = 0;
	this.x = x; 
	this.y = y;
	this.ySpeed = 1;
	this.rWidth = 25;
	this.rHeight = 5;
	this.alpha = 255;

	this.drawRing = function(inX, inY)
	{
		// Draws the hover particles according to the type of movement 
		if(isLeft && isFalling)
		{
			push();
			rotate(-20);
			noFill();
			stroke(0, 0, 200, this.alpha)
			ellipse((inX+25)*cos(20) - (inY)*sin(20), 
			(inY)*cos(20) + (inX+25)*sin(20) + this.y - 420, 
					this.rWidth, this.rHeight + 2);
			pop();
		}
		else if(isRight && isFalling)
		{
			push();
			rotate(20);
			noFill();
			stroke(0, 0, 200, this.alpha)
			ellipse((inX)*cos(-20) - (inY - 70)*sin(-20), 
			(inY - 70)*cos(-20) + (inX)*sin(-20) + this.y - 345, 
					this.rWidth, this.rHeight + 2);   // NB change 310 for heigh
			pop();
		}
		else if(isLeft)
		{
			push();
			rotate(-20);
			noFill();
			stroke(0, 0, 200, this.alpha)
			ellipse((inX+25)*cos(20) - (inY)*sin(20), 
			(inY)*cos(20) + (inX+25)*sin(20) + this.y - 420, 
					this.rWidth, this.rHeight);
			pop();
		}
		else if(isRight)
		{
			push();
			rotate(20);
			noFill();
			stroke(0, 0, 200, this.alpha)
			ellipse((inX)*cos(-20) - (inY - 70)*sin(-20), 
			(inY - 70)*cos(-20) + (inX)*sin(-20) + this.y - 345, 
					this.rWidth, this.rHeight);   // NB change 310 for heigh
			pop();
		}
		else if(isFalling || isPlummeting)
		{
			noFill();
			stroke(0, 0, 200, this.alpha)
			ellipse(inX, inY + this.y - 430, this.rWidth, this.rHeight - 2);
		}
		else
		{
			noFill();
			stroke(0, 0, 200, this.alpha)
			ellipse(inX, inY + this.y - 420, this.rWidth, this.rHeight);
		}
	}

	this.updatePrticle = function()
	{
		this.rWidth -= 0.8;
		this.rHeight -= 0.2; 
		this.alpha = map(this.rDist, 0, 22, 255, 50);
		
		this.y += ySpeed;
		this.rDist += ySpeed;
	}
}

function Emitter(x, y, speedy)
{
	//The main function for the hover rings. 
	this.x = x; 
	this.y = y;
	this.ySpeed = 1;
	this.rWidth = 25;
	this.rHeight = 5;
	this.alpha = 255;
	this.speedy = speedy;

	this.lifetime = 0;

	this.rings = [];

	this.addRing = function()
	{
		var ringsCall = new Ring(this.x, this.y, this.ySpeed);
		return ringsCall;
	}

	this.startEmitter = function(lifetime)
	{
		this.lifetime = lifetime;

		this.rings.push(this.addRing());
	}

	this.updateRings = function(inX, inY)
	{
		for(var i = this.rings.length-1; i >= 0; i--)
		{
			this.rings[i].drawRing(inX, inY);
			this.rings[i].updatePrticle();

			//kill particle if it is far enough
			if(this.rings[i].rDist > this.lifetime)
			{
				this.rings.splice(i, 1);
			}
		}
		
		if((this.rings[this.rings.length-1].y-400) > this.speedy)
		{
			this.rings.push(this.addRing())
		}
	}
}

function startGame(livesIn, levelIn, scoreIn)
{
	// The core restart function
	background(100, 155, 255);

	gameChar_x = width/2;
	gameChar_y = floorPos_y;
	scrollPos = 0;
	game_score = scoreIn;
	lives = livesIn;
	level = levelIn;
	isLoggingScore = false;

	// world_x needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;

	// Initialise arrays of scenery objects.
	trees_x = [200, 300, 500, 1000, 1200];

	clouds = [
		{x_pos: 100, y_pos: 100, size: 50},
		{x_pos: 200, y_pos: 75, size: 50},
		{x_pos: 400, y_pos: 100, size: 50},
		{x_pos: 1000, y_pos: 100, size: 50},
		{x_pos: 1200, y_pos: 130, size: 50},
		{x_pos: 600, y_pos: 120, size: 50},
		{x_pos: 7000, y_pos: 50, size: 50},
		{x_pos: 500, y_pos: 180, size: 50}
		];

	mountains = [
		{x_pos: 100, y_pos: floorPos_y, size: 50},
		{x_pos: 500, y_pos: floorPos_y, size: 30},
		{x_pos: 1200, y_pos: floorPos_y, size: 60},
	];

	canyons = [
		{x_pos: -50, width: 100},
		{x_pos: 600, width: 100},
		{x_pos: 1010, width: 100},
		{x_pos: 1600, width: 100}
	];

	//Initialise the arrays empty and fill them for every level. 
	enemies = [];
	platforms = [];
	collectables = [];
	
	if(level == 1)
	{
		collectables = [
			{x_pos: -100,	y_pos: floorPos_y, isFound: false},
			{x_pos: 300,	y_pos: floorPos_y, isFound: false},
			{x_pos: 800,	y_pos: floorPos_y, isFound: false},
			{x_pos: 900,	y_pos: floorPos_y, isFound: false},
			{x_pos: 1700,	y_pos: floorPos_y, isFound: false},
		];

		flagpole = {isReached: false, x_pos: 1900, y_pos: floorPos_y};
	}
	else if(level == 2)
	{
		platforms.push(createPlatforms(350, 350, 50));
		platforms.push(createPlatforms(550, 270, 100));
		platforms.push(createPlatforms(-300, 350, 30));
		platforms.push(createPlatforms(-150, 270, 60));
		platforms.push(createPlatforms(1500, 350, 60));
		platforms.push(createPlatforms(1750, 350, 60));
		platforms.push(createPlatforms(1900, 270, 120));
		platforms.push(createPlatforms(2050, 350, 60));

		collectables.push({x_pos: -150,	y_pos: 270, isFound: false});
		collectables.push({x_pos: 580,	y_pos: 270, isFound: false});
		collectables.push({x_pos: -100,	y_pos: floorPos_y, isFound: false});
		collectables.push({x_pos: 1450,	y_pos: 350, isFound: false});
		collectables.push({x_pos: 1760,	y_pos: floorPos_y, isFound: false});
		collectables.push({x_pos: 2080,	y_pos: 350, isFound: false});

		flagpole = {isReached: false, x_pos: 1900, y_pos: 270};
	}
	else if(level >= 3)
	{
		enemies.push(new Enemy(100, floorPos_y - 5, 100, 1, 3));
		enemies.push(new Enemy(-350, floorPos_y - 5, 170, 2, 5));
		enemies.push(new Enemy(900, 350, 100, 1, 2));
		enemies.push(new Enemy(1340, 270, 100, 1, 2));
		enemies.push(new Enemy(1700, floorPos_y - 5, 100, 1, 5));
		enemies.push(new Enemy(2000, floorPos_y - 5, 200, 1, 5));

		platforms.push(createPlatforms(830, 270, 60));
		platforms.push(createPlatforms(960, 350, 100));
		platforms.push(createPlatforms(1350, 350, 30));
		platforms.push(createPlatforms(1530, 270, 150));

		collectables.push({x_pos: -100,	y_pos: floorPos_y, isFound: false});
		collectables.push({x_pos: 710,	y_pos: floorPos_y, isFound: false});
		collectables.push({x_pos: 810,	y_pos: 270, isFound: false});
		collectables.push({x_pos: 1620,	y_pos: 270, isFound: false});
		collectables.push({x_pos: 1930,	y_pos: floorPos_y, isFound: false});
		collectables.push({x_pos: 1973,	y_pos: floorPos_y, isFound: false});

		flagpole = {isReached: false, x_pos: -400, y_pos: floorPos_y};
	}

	gameChar_x = width/2;
	gameChar_y = floorPos_y - 25;

	//Initiate the hover rings
	emit = new Emitter(gameChar_x, gameChar_y, 15);

	emit.startEmitter(25); 
	//Leave the 25 be, its the distance from the char to the end of faiding 25 is good

	hoverSound.loop(1)
}



/*
Sources: 
- Images: MillionthVector(04:02PM 28 Nov 2015)https://millionthvector.blogspot.com/2015/11/even-more-new-free-sprites.html (Accessed: 10-08-2021)
		  MillionthVector(12:54AM 28 Nov 2015)https://millionthvector.blogspot.com/2015/11/new-free-sprites.html (Accessed: 11-08-2021)

- Font: HolyJollie(JUN 17, 2021)https://www.fontspace.com/pasti-font-f62804 (Accessed: 10-08-2021)

- Sounds: https://mixkit.co/free-sound-effects/ (Accessed: 31-08-2021)
*/