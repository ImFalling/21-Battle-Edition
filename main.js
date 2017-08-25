document.addEventListener("DOMContentLoaded", function(e){
    InitializeGame();
}, false);

var Globals = {
    Player1: {},
    Player2: {},
    Canvas: {},
    Context: {},
    Gravity: 1.05,
    Paused: false,
    Respawn: function(){
        Globals.Player1.X = 0;
        Globals.Player2.X = Globals.Canvas.width - Globals.Player2.Size;
        Globals.Player1.Y = 0;
        Globals.Player2.Y = 0;
        Globals.Player1.hasJumped = true;
        Globals.Player2.hasJumped = true;
        Platforms = [];
        Platforms.push(new Platform(Globals.Player1.X, 150, 35, 10));
        Platforms.push(new Platform((Globals.Canvas.width- 35), 150, 35, 10));  

        
        if(Globals.Player1.GetScore() == 21 && Globals.Player2.GetScore() == 21){
            alert("It's a tie!")
            Globals.Player1.SetScore(0);
            Globals.Player2.SetScore(0);
        }

        else if(Globals.Player1.GetScore() == 21 && Globals.Player2.GetScore() != 21){
            alert("Player 1 won!")
            Globals.Player1.SetScore(0);
            Globals.Player2.SetScore(0);
        }

        else if(Globals.Player2.GetScore() == 21 && Globals.Player1.GetScore() != 21){
            alert("Player 2 won!")
            Globals.Player1.SetScore(0);
            Globals.Player2.SetScore(0);
        }

        if(Globals.Player1.GetScore() > 21){
            Globals.Player1.SetScore(0);
        }

        if(Globals.Player2.GetScore() > 21){
            Globals.Player2.SetScore(0);
        }

        Globals.Paused = true;  
        setTimeout(function(){
            Globals.Paused = false;
        }, 200);     
    },
    Textures: {
        p1: () => {
            var img = new Image(124,124);
            img.src = "img/p1.png";
            return img;
        },
        p2: () => {
            var img = new Image(124,124);
            img.src = "img/p2.png";
            return img;
        },
        platLeft: () => {
            var img = new Image(124,124);
            img.src = "img/platLeft.png";
            return img;
        },
        platMid: () => {
            var img = new Image(124,124);
            img.src = "img/platMid.png";
            return img;
        },
        platRight: () => {
            var img = new Image(124,124);
            img.src = "img/platRight.png";
            return img;
        }
    }

};

var Platforms = [];

function InitializeGame(){
    Globals.Player1 = new Player(1);
    Globals.Player2 = new Player(2);
    Globals.Canvas = document.getElementById("playField");
    Globals.Context = Globals.Canvas.getContext('2d');
    Globals.Player2.X = Globals.Canvas.width - Globals.Player2.Size;
    Platforms.push(new Platform(Globals.Player1.X, 50, 35, 10));
    Platforms.push(new Platform((Globals.Canvas.width- 35), 50, 35, 10));    
    Platforms.push(new Platform(getRandom(-50, Globals.Canvas.width - 60), Globals.Canvas.height + 10, getRandom(35, 55), 10));    
    
    setInterval(function(){
        for(var i = 0; i < getRandom(1, 3); i++){
            Platforms.push(new Platform(getRandom(-50, Globals.Canvas.width - 60), Globals.Canvas.height + 10, getRandom(35, 55), 10));
        }
    }, 750);

    window.addEventListener("keydown", function(e){

        /* Keycode Legend

            LeftArrow: 37
            UpArrow: 38
            RightArrow: 39
            DownArrow: 40
            RightCTRL: 17

            A: 65
            W: 87
            D: 68
            S: 83
            Space: 32
            
        */

        p1ctrl = Globals.Player1.Controller;
        p2ctrl = Globals.Player2.Controller;

        var key = e.which;

        switch(key){
            case 65:
                p1ctrl.leftPressed = true;
                break;
            case 87:
                p1ctrl.jumpPressed = true;
                break;
            case 68:
                p1ctrl.rightPressed = true;
                break;
            case 32:
                p1ctrl.attackPressed = true;
                break;

            case 37:
                p2ctrl.leftPressed = true;
                break;
            case 38:
                p2ctrl.jumpPressed = true;
                break;
            case 39:
                p2ctrl.rightPressed = true;
                break;
            case 17:
                p2ctrl.attackPressed = true;
                break;
        }
        
    });

    window.addEventListener("keyup", function(e){

        p1ctrl = Globals.Player1.Controller;
        p2ctrl = Globals.Player2.Controller;

        var key = e.which;

        switch(key){
            case 65:
                p1ctrl.leftPressed = false;
                break;
            case 87:
                p1ctrl.jumpPressed = false;
                Globals.Player1.hasJumped = true;                
                break;
            case 68:
                p1ctrl.rightPressed = false;
                break;
            case 32:
                p1ctrl.attackPressed = false;
                break;

            case 37:
                p2ctrl.leftPressed = false;
                break;
            case 38:
                p2ctrl.jumpPressed = false;
                Globals.Player2.hasJumped = true;
                break;
            case 39:
                p2ctrl.rightPressed = false;
                break;
            case 17:
                p2ctrl.attackPressed = false;
                break;
        }
        
    });

    window.requestAnimationFrame(Update);
    
}

function Player(id){

    /*
        [Player Variables]
    */
    this.X = 0;
    this.Y = 0;
    this.Size = 10;
    this.ID = id;
    this.Score = 0;
    this.Velocity = {x: 0, y: 0};
    this.TerminalVelocity = 12;
    this.hasJumped = false;
    this.SideColliding = {right: false, left: false};

    this.Controller = {
        leftPressed: false,
        rightPressed: false,
        jumpPressed: false,
        attackPressed: false
    }


    /* 
        [DOM References]
    */
    this.ScoreRef = document.getElementById("player"+this.ID+"Score");

    /*
        [Accessor Methods]
    */
    this.GetScore = function(){
        return this.ScoreRef.innerHTML;
    };

    this.SetScore = function(score){
        this.ScoreRef.innerHTML = "";
        this.ScoreRef.innerHTML = score;
    }

    /*
        [Core Methods]
    */

    this.Transform = function(x, y){
        this.X += x;
        this.Y += y;
        if(this.X > Globals.Canvas.width + this.Size){
            this.X = -this.Size;
        }
        else if(this.X < -this.Size){
            this.X = Globals.Canvas.width + this.Size;
        }
    }

    this.Draw = function(){
        Globals.Context.drawImage(Globals.Textures["p"+this.ID](), 0, 0, 20, 20);
        
    }

    this.Update = function(){
        var resultant = {
            x: 0,
            y: 0
        }

        //Take Gravity into account first
        if(this.Velocity.y == 0)
            this.Velocity.y = 1;
        this.Velocity.y *= Globals.Gravity;

        //Check if the velocity is not higher than the maximum velocity for a player entity
        if(this.Velocity.y > this.TerminalVelocity)
            this.Velocity.y = this.TerminalVelocity;

        //Check if the player is colliding
        for(var i = 0; i < Platforms.length; i++){

            //Y-Collision
            if(this.collidesWithY(Platforms[i])){
                this.Y = Platforms[i].Y + 1 - this.Size;
                this.Velocity.y = 0;
                this.hasJumped = false;
                break;
            }
            
            //X-Collision
            var currentCollisionWithX = this.collidesWithX(Platforms[i]);
            if(currentCollisionWithX.left || currentCollisionWithX.right){
                this.SideColliding = currentCollisionWithX;
                break;
            }
            
            else if(!currentCollisionWithX.left && !currentCollisionWithX.right && i == Platforms.length - 1){
                this.SideColliding = currentCollisionWithX;
            }
        };

        //Check if the player is jumping
        if(this.Controller.jumpPressed && this.hasJumped == false){

            this.Transform(0, -4);
            //Make sure the velocity is multipliable before adjusting
            if(this.Velocity.y == 0){
                //Clear the player from the platform collision
                this.Velocity.y = -1;
            }
            this.Velocity.y *= 1.005;
        }

        if(this.Velocity.y < -1.5){
            this.Velocity.y = 1;
        }

        //Apply the velocity to the resultant
        resultant.y += this.Velocity.y;

        if(this.Controller.rightPressed && !(this.SideColliding.right)){
            resultant.x += 2;
        }
        else if(this.Controller.leftPressed && !(this.SideColliding.left)){
            resultant.x -= 2;
        }

        this.Transform(resultant.x, resultant.y);
        this.Draw();

        //Check for boundary deaths
        if((this.Y + this.Size < 0) || (this.Y > Globals.Canvas.height)){
            this.SetScore(Number(this.GetScore()) + 1);
            if(this.ID == 1)
                Globals.Player2.SetScore(Number(Globals.Player2.GetScore()) + 2);
            else
                Globals.Player1.SetScore(Number(Globals.Player1.GetScore()) + 2);

            Globals.Respawn();

        }
    }

    this.collidesWithY = function(platform){
        var securityFactor = 3;
        if( 
            ((this.Y + this.Size) >= (platform.Y - securityFactor)) && 
            ((this.Y) < (platform.Y + platform.Height)) &&
            ((this.X + this.Size) >= platform.X) &&
            ((this.X) <= (platform.X + platform.Width))
        )
            return true;
        else
            return false;
    } 
    
    this.collidesWithX = function(platform){
        var securityFactor = 1;
        if( 
            ((this.X + this.Size) >= (platform.X - securityFactor)) && 
            ((this.X + this.Size) <= (platform.X)) &&             
            ((this.Y) <= (platform.Y + platform.Height + this.Size)) &&
            ((this.Y + this.Size) >= (platform.Y - this.Size))
        ){
            console.log("HelloW");
            return {right: true, left: false};
        }
        else if(
            ((this.X) <= (platform.X + platform.Width + securityFactor)) && 
            ((this.X) >= (platform.X + platform.Width)) &&             
            ((this.Y) <= (platform.Y + platform.Height + this.Size)) &&
            ((this.Y + this.Size) >= (platform.Y - this.Size))
        ){
            return {right: false, left: true}
        }
        else
            return {right: false, left: false};
    }    
}

function Platform(x, y, width, height){
    this.X = x;
    this.Y = y;
    this.Width = width;
    this.Height = height;

    this.Draw = function(){
        Globals.Context.fillStyle = "white";
        Globals.Context.fillRect(this.X, this.Y, this.Width, this.Height);
    }

    this.Update = function(){
        this.Y -= 1.0;
    }

}

function Update(){
    clearField();
    Platforms.forEach(function(element) {
        element.Draw();
        if(!Globals.Paused)
            element.Update();
    }, this);
    Platforms.forEach(function(element){
        if(element.Y + element.Height < 0){
            Platforms.shift();
        }
    }, this);
    if(!Globals.Paused){    
        Globals.Player1.Update();
        Globals.Player2.Update();
    }
    requestAnimationFrame(Update);
}

//Repaint method
function clearField(){
    Globals.Context.clearRect(0,0,Globals.Canvas.width, Globals.Canvas.height);
}

function getRandom(min, max){
    return Math.random() * (max - min) + min;
}
