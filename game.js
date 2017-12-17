// Inheritence ---------------------------------------------------------------------
var inherits_from = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
};

// DrawnObject ---------------------------------------------------------------------
var DrawnObject = function (sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
    this.rotation = 0;
};

// Character -----------------------------------------------------------------------
var Character = function (damage, speed, defence, health) {
    this.damage = damage;
    this.speed = speed;
    this.defence = defence;
    this.health = health;
    this.id;
};

inherits_from(Character, DrawnObject);

// Turret --------------------------------------------------------------------------
var Turret = function (radius, ammo_type, direction, rate_of_fire) {
    this.radius = radius;
    this.ammo_type = ammo_type;
    this.direction = direction;
    this.rate_of_fire = rate_of_fire;
    this.original_x = 0;
    this.original_y = 0;
    this.target = null;
};

inherits_from(Turret, Character);

// Enemy ---------------------------------------------------------------------------
var Enemy = function () {
    this.line = 0;
};

inherits_from(Enemy, Character);

// Bullet --------------------------------------------------------------------------
var Bullet = function () {
};

inherits_from(Bullet, DrawnObject);

// Player --------------------------------------------------------------------------
var Player = function () {
    this.left = false;
    this.right = false;
    this.up = false;
    this.down = false;
    this.lives = 10;
    this.points = 10;
    this.score = 0;
};

inherits_from(Player, DrawnObject);

// Ring ----------------------------------------------------------------------------
var Ring = function (radius, max_turrets) {
    this.radius = radius;
    this.max_turrets = max_turrets;
};

inherits_from(Ring, DrawnObject);

// Level ---------------------------------------------------------------------------
var Level = function (id, lines, waves) {
    this.id = id;
    this.lines = lines;
    this.waves = waves;
    this.draw = [];
    this.line_angles = [];
};

// Coin ----------------------------------------------------------------------------
var Coin = function () {

};

inherits_from(Coin, DrawnObject);

// Game ----------------------------------------------------------------------------
var Game = function () {
    this.levels = [];
    this.enemies = [];
    this.turrets = [];
    this.bullets = [];
    this.player;
    this.coins = [];
};

// On Load -------------------------------------------------------------------------
window.onload = function () {

    var width = 700;
    var height = 700;
    var level_number = 0;

    // The paper
    var paper = new Raphael(0, 0, width, height);

    // The background
    var background = paper.rect(0, 0, width, height);
    background.attr({fill: "orange"});

    //Create levels
    var game = new Game();
    game.levels.push(new Level(0, 1, 3));
    game.levels.push(new Level(1, 2, 6));
    game.levels.push(new Level(2, 3, 9));
    game.levels.push(new Level(3, 4, 12));
    game.levels.push(new Level(4, 5, 15));
    game.levels.push(new Level(5, 6, 18));
    
    var enemy_count = 0;

    //Draw the rings
    var enemy_hole = paper.circle(width / 2, height / 2, 30);
    enemy_hole.attr({fill: "black"});

    var ring = new Ring(100, 5);
    ring.sprite = paper.circle(width / 2, height / 2, ring.radius);

    var ring2 = new Ring(200, 5);
    ring2.sprite = paper.circle(width / 2, height / 2, ring2.radius);

    var ring3 = new Ring(300, 5);
    ring3.sprite = paper.circle(width / 2, height / 2, ring3.radius);
    
    var current_level = game.levels[level_number];

    //Get the level and draw the lines
    function load_level(){
        current_level = game.levels[level_number];
        for (i = 0; i < current_level.lines; i++) {
            var angle = (2 * Math.PI) / current_level.lines;
            current_level.line_angles[i] = (angle * i);
            var new_x = (width * Math.cos(current_level.line_angles[i]));
            var new_y = (height * Math.sin(current_level.line_angles[i]));
            current_level.draw[i] = paper.path("M " + width / 2 + " " + height / 2 + " l " + new_x + " " + new_y);
        }
    }

    load_level();
    
    var menu = paper.rect(50, 600, 70, 70, 5).attr({fill: "red"});
    var menu2 = paper.rect(520, 5, 120, 85, 5).attr({fill: "red"});
    var cost_text = paper.text(85, 660, "Cost: 5").attr({"font-size": 15, fill: "white"});

    var dummy_turret;
    create_dummy_turret();
    var grey_turret = paper.image("images/grey_turret.png", 50, 600, 60, 60);

    // Create Player
    function create_player() {
        game.player = new Player();
        game.player.x = 500;
        game.player.y = 500;
        game.player.rotation = 0;
        game.player.sprite = paper.image("images/sprite3.png", game.player.x, game.player.y, 40, 40);
    }

    create_player();

    var points_text = paper.text(580, 50, "Points: 0\nLives: " + game.player.lives + "\nScore: " + game.player.score);
    points_text.attr({"font-size": 20, fill: "white"});

    // Create enemy
    function create_enemies() {
        var enemy1 = new Enemy();
        enemy1.id = game.enemies.length;
        enemy1.x = width / 2 - 15;
        enemy1.y = height / 2 - 15;
        enemy1.health = 4;
        enemy1.sprite = paper.image("images/sprite4.png", enemy1.x, enemy1.y, 30, 30);
        enemy1.line = Math.floor((Math.random() * current_level.lines) + 1);
        game.enemies.push(enemy1);
    }

    // Enemy update
    function enemy_update(enemy) {
        var newX = enemy.x + (1 * Math.cos(current_level.line_angles[enemy.line - 1]));
        var newY = enemy.y + (1 * Math.sin(current_level.line_angles[enemy.line - 1]));

        enemy.x = newX;
        enemy.y = newY;

        enemy.sprite.animate({x: newX, y: newY}, 100);

        if (enemy.x > width || enemy.x < -10 || enemy.y > height || enemy.y < -10) {
            var index = game.enemies.indexOf(enemy);
            enemy.sprite.remove();
            game.enemies.splice(index, 1);

            for (i = 0; i < game.turrets.length; i++) {
                if (game.turrets[i].target === enemy) {
                    game.turrets[i].target = null;
                }
            }

            if (game.player.lives > 0) {
                game.player.lives--;
            }
        }
    }

    function create_dummy_turret() {
        dummy_turret = new Turret(0, 0, 0);
        dummy_turret.x = 50;
        dummy_turret.y = 600;
        dummy_turret.original_x = 50;
        dummy_turret.original_y = 600;
        dummy_turret.rotation = 0;
        dummy_turret.sprite = paper.image("images/sprite2.png", dummy_turret.x, dummy_turret.y, 60, 60);
        dummy_turret.sprite.drag(
                function (dx, dy) {
                    dummy_turret.x = dummy_turret.original_x + dx;
                    dummy_turret.y = dummy_turret.original_y + dy;
                    dummy_turret.sprite.attr({x: dummy_turret.x, y: dummy_turret.y});
                },
                function (dx, dy) {
                    dummy_turret.x = dummy_turret.original_x + dx;
                    dummy_turret.y = dummy_turret.original_y + dy;
                    dummy_turret.sprite.attr({x: dummy_turret.x, y: dummy_turret.y});
                },
                function () {
                    var radius = 0;
                    var plusW = (width / 2) + ring.radius + 20;
                    var minusW = (width / 2) - ring.radius - 20;
                    var plusH = (height / 2) + ring.radius + 20;
                    var minusH = (height / 2) - ring.radius - 20;
                    if (dummy_turret.x < plusW && dummy_turret.y < plusH && dummy_turret.x > minusW && dummy_turret.y > minusH) {
                        radius = ring.radius;
                    } else if (dummy_turret.x < (width / 2) + ring2.radius + 20 && dummy_turret.y < (height / 2) + ring2.radius + 20 && dummy_turret.x > (width / 2) - ring2.radius - 20 && dummy_turret.y > (height / 2) - ring2.radius - 20) {
                        radius = ring2.radius;
                    } else {
                        radius = ring3.radius;
                    }

                    var angleA = 2 * Math.PI * (Raphael.angle(dummy_turret.x, dummy_turret.y, width / 2, height / 2) / 360);
                    var new_x = (width / 2) - 15 + (radius * Math.cos(angleA));
                    var new_y = (height / 2) - 15 + (radius * Math.sin(angleA));
                    dummy_turret.x = new_x;
                    dummy_turret.y = new_y;
                    dummy_turret.sprite.attr({x: dummy_turret.x, y: dummy_turret.y});
                    create_turret(dummy_turret.x, dummy_turret.y);
                    dummy_turret.sprite.remove();
                    create_dummy_turret();
                    game.player.points -= 5;
                });
    }

    // Create turret 
    function create_turret(start_x, start_y) {
        var turret = new Turret(200, 0, 0);
        turret.x = start_x;
        turret.y = start_y;
        turret.rotation = 0;
        turret.sprite = paper.image("images/sprite2.png", turret.x, turret.y, 30, 30);
        game.turrets.push(turret);
    }
    
    // Turret update
    function turret_update(turret) {
        var plusW = turret.x + turret.radius;
        var minusW = turret.x - turret.radius;
        var plusH = turret.y + turret.radius;
        var minusH = turret.y - turret.radius;
        if (turret.target === null) {
            for (i = 0; i < game.enemies.length; i++) {
                if (game.enemies[i].x < plusW && game.enemies[i].x > minusW && game.enemies[i].y < plusH && game.enemies[i].y > minusH) {
                    turret.target = game.enemies[i];
                    break;
                }
            }
        } else {
            var angle = Raphael.angle(turret.x, turret.y, turret.target.x, turret.target.y) - 180;
            turret.sprite.transform("r" + angle);
            turret.rotation = angle;
            if (!(turret.target.x < plusW && turret.target.x > minusW && turret.target.y < plusH && turret.target.y > minusH)) {
                turret.target = null;
            }
        }
    }

    function wrap_around() {
        if (game.player.x > width) {
            game.player.x = -15;
        }
        if (game.player.y > height) {
            game.player.y = -15;
        }
        if (game.player.x < -15) {
            game.player.x = width;
        }
        if (game.player.y < -15) {
            game.player.y = height;
        }
    }

    function fire(turret) {
        create_bullet(turret.x, turret.y, turret.rotation);
    }

    function create_bullet(start_x, start_y, start_rotation) {
        var bullet = new Bullet();
        bullet.rotation = 2 * Math.PI * (start_rotation / 360);
        bullet.x = start_x + 15;
        bullet.y = start_y + 15;
        bullet.sprite = paper.rect(start_x, start_y, 2, 4);
        bullet.sprite.transform("r" + bullet.rotation);
        game.bullets.push(bullet);
    }

    function bullet_update(bullet) {
        var rads = bullet.rotation;
        var newX = bullet.x + (10 * Math.cos(rads));
        var newY = bullet.y + (10 * Math.sin(rads));

        bullet.x = newX;
        bullet.y = newY;

        bullet.sprite.animate({x: newX, y: newY}, 100);

        if (bullet.x > width || bullet.x < -10 || bullet.y > height || bullet.y < -10) {
            var index = game.bullets.indexOf(bullet);
            bullet.sprite.remove();
            game.bullets.splice(index, 1);
        }
    }

    function PlayerMovement() {
        document.addEventListener('keydown', function (event) {
            if (event.keyCode === 37) {
                game.player.left = true;
            }
            if (event.keyCode === 39) {
                game.player.right = true;
            }
            if (event.keyCode === 38) {
                game.player.up = true;
            }
            if (event.keyCode === 40) {
                game.player.down = true;
            }
        });
        document.addEventListener('keyup', function (event) {
            if (event.keyCode === 37) {
                game.player.left = false;
            }
            if (event.keyCode === 39) {
                game.player.right = false;
            }
            if (event.keyCode === 38) {
                game.player.up = false;
            }
            if (event.keyCode === 40) {
                game.player.down = false;
            }
        });
    }

    function player_update() {
        var speed = 0;
        if (game.player.left) {
            game.player.rotation -= 20;
        }
        if (game.player.right) {
            game.player.rotation += 20;
        }
        if (game.player.up) {
            speed = 10;
        }
        if (game.player.down) {
            speed = -10;
        }
        game.player.sprite.transform("r" + (game.player.rotation + 90));
        var final_angle = 2 * Math.PI * (game.player.rotation / 360);
        var newX = game.player.x + (speed * Math.cos(final_angle));
        var newY = game.player.y + (speed * Math.sin(final_angle));
        game.player.x = newX;
        game.player.y = newY;

        game.player.sprite.animate({x: newX, y: newY}, 1);
    }

    function create_coin(start_x, start_y) {
        var coin = new Coin();
        coin.x = start_x;
        coin.y = start_y;
        coin.sprite = paper.image("images/coin.png", coin.x, coin.y, 30, 30);
        game.coins.push(coin);
    }

    PlayerMovement();

    // Collision detection
    function CollisionDetectionPoint(point_x, point_y, enemy_x, enemy_y, enemy_width, enemy_height, enemy_angle) {
       var check_x = enemy_x + (point_x - enemy_x) * Math.cos(-enemy_angle) - (point_y - enemy_y) * Math.sin(-enemy_angle);
       var check_y = enemy_y + (point_x - enemy_x) * Math.sin(-enemy_angle) + (point_y - enemy_y) * Math.cos(-enemy_angle);
        return ((check_x >= (enemy_x - (enemy_width / 2))) && (check_x <= (enemy_x + (enemy_width / 2))) && (check_y >= (enemy_y - (enemy_height / 2))) && (check_y <= (enemy_y + (enemy_height / 2))));
    }

    function check_points() {
        if (game.player.points > 4) {
            dummy_turret.sprite.show();
            grey_turret.hide();
        } else {
            grey_turret.show();
            dummy_turret.sprite.hide();
        }
    }

    function Reset_level(){
        //game = new game();
        load_level();
        enemy_count = 0;
    }

    //Start update
    function Update() {
        var start_time = new Date();
        startTime_interval = setInterval(function () {

            var today = new Date();

            if (today.getSeconds() - start_time.getSeconds() > 2) {
                if (game.levels[level_number].waves > enemy_count) {
                    create_enemies();
                    enemy_count++;
                }
                start_time = today;
            }
            if (today.getSeconds() === 0) {
                start_time = today;
            }

            if (game.player.lives < 1) {
                game_over.show();
            }
            if (enemy_count === game.levels[level_number].waves && game.enemies.length === 0){
                level_number++;
                Reset_level();
            }

            for (j = 0; j < game.turrets.length; j++) {
                turret_update(game.turrets[j]);
                if (today.getMilliseconds() - start_time.getMilliseconds() > 800 && game.turrets[j].target !== null) {
                    fire(game.turrets[j]);
                }
            }

            for (l = 0; l < game.enemies.length; l++) {
                for (k = 0; k < game.bullets.length; k++) {
                    if (CollisionDetectionPoint(game.bullets[k].x, game.bullets[k].y, game.enemies[l].x, game.enemies[l].y, 30, 30, 180)) {
                        var index = game.bullets.indexOf(game.bullets[k]);
                        game.bullets[k].sprite.remove();
                        game.bullets.splice(index, 1);

                        game.enemies[l].health -= 1;
                        if (game.enemies[l].health === 0) {
                            create_coin(game.enemies[l].x, game.enemies[l].y);
                            var index2 = game.enemies.indexOf(game.enemies[l]);
                            game.enemies[l].sprite.remove();
                            game.enemies.splice(index2, 1);
                            game.player.score += 100;

                            for (i = 0; i < game.turrets.length; i++) {
                                if (game.turrets[i].target === game.enemies[l]) {
                                    game.turrets[i].target = null;
                                }
                            }
                        }
                    }
                }
            }

            for (i = 0; i < game.bullets.length; i++) {
                bullet_update(game.bullets[i]);
            }

            for (n = 0; n < game.enemies.length; n++) {
                enemy_update(game.enemies[n]);
            }

            for (m = 0; m < game.coins.length; m++) {
                if (CollisionDetectionPoint(game.coins[m].x, game.coins[m].y, game.player.x, game.player.y, 30, 30, game.player.rotation)) {
                    var index = game.coins.indexOf(game.coins[m]);
                    game.coins[m].sprite.remove();
                    game.coins.splice(index, 1);

                    game.player.points++;
                }
            }

            player_update();
            wrap_around();
            check_points();

            points_text.attr({text: "Points: " + game.player.points + "\nLives: " + game.player.lives + "\nScore: " + game.player.score});
        }, 100);
    }

    Update();

    var game_over = paper.text(width / 2, height / 2, "Game Over!");
    game_over.attr({fill: "white", "font-size": 50});
    game_over.hide();
};