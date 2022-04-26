// Snake.js

import Player from "./Player.js";

/**
 * The global game configurations
 */

let food = {x: 13, y:7}

let specialAreas = []


const Snake = {

    snake: [],
    x: 0,
    y: 0,
    d: "UP",
    score: 0,
    died : false,

    init : function () {
        Snake.x = 7;
        Snake.y = 14;
        for ( let i = 0; i < 5 ; i++){
            Snake.snake.push({
                x: 7, y: 14 + i
            })

            if (isLevelArea(7, 14+i)) PS.color(7, 14+i, PS.COLOR_WHITE);
        }

        PS.color(food.x, food.y, 66, 66, 66)
        // specialAreas[0] = {x:11, y:14}
        // for ( let i = 0; i < 4 ; i++){
        //     specialAreas[i] = {
        //         x:11+i, y:15
        //     }
        // }

    },

    update : function () {
        if (Snake.died) return;

        if (Snake.score > 5) {
            PS.statusText("That is the prototype. Thanks for playing!")
            // DM.showMessage("Normal Ending. Thanks for playing!");
            Snake.died = true;
            return;
        }


        if(!isLevelArea(Snake.snake[0].x, Snake.snake[0].y)){
            PS.statusText("That is the prototype. Thanks for playing!")
            Snake.died = true;
            return;
        }

        PS.color(Snake.snake[0].x, Snake.snake[0].y, 0xFFFFFF);
        for( let i = 1; i < Snake.snake.length ; i++){
            const x = Snake.snake[i].x;
            const y = Snake.snake[i].y;

            if (isLevelArea(x, y)) PS.color(x, y, 0xFFFFFF)
        }

        // old head position
        let snakeX = Snake.snake[0].x;
        let snakeY = Snake.snake[0].y;

        // which direction
        if( Snake.d === "LEFT") snakeX -= 1;
        if( Snake.d === "UP") snakeY -= 1;
        if( Snake.d === "RIGHT") snakeX += 1;
        if( Snake.d === "DOWN") snakeY += 1;


        // if the snake eats the food
        if(snakeX === food.x && snakeY === food.y){
            Snake.score++;

            let x, y;

            x = Math.floor(Math.random()*16);
            y = Math.floor(Math.random()*16);
            while (!isValidArea(x, y)) {
                x = Math.floor(Math.random()*16);
                y = Math.floor(Math.random()*16);
            }

            food = {
                x: x, y: y
            }
            PS.color(food.x, food.y, 66, 66, 66)
        }else{
            // remove the tail
            const tail = Snake.snake.pop();
            if (isLevelArea(tail.x, tail.y))  PS.color(tail.x, tail.y, 0, 0, 0)
        }

        // add new Head

        let newHead = {
            x : snakeX,
            y : snakeY
        }

        // game over

        // if(collision(newHead,Snake.snake)){
        //     // DM.showMessage("Snake Game Dead. Thanks for playing!");
        //     PS.statusText("That is the prototype. Thanks for playing!");
        //     Snake.died = true;
        //     return;
        // }
        //
        // if (collision(newHead, specialAreas)) {
        //     // DM.showMessage("Easter Egg Ending. Thanks for playing!");
        //     PS.statusText("That is the prototype. Thanks for playing!");
        //     Snake.died = true;
        //     return;
        //
        // }

        Snake.snake.unshift(newHead);
    }


}



// check collision function
function collision(head,array){
    for(let i = 0; i < array.length; i++){
        if(head.x === array[i].x && head.y === array[i].y){
            return true;
        }
    }
    return false;
}

function isValidArea(x , y){

    // const data = PS.data(x,y);
    // let answer = true;

    // if (!data.tags.includes("black_background")) answer = false;
    // Snake.snake.forEach( coord => {
    //     if (coord.x === x && coord.y === y) answer = false;
    // })

    return isLevelArea( x , y );

}

function isLevelArea( x , y ) {
    return ! ( (x < 0) || (y < 0) || (x > 15) || (y > 15));
}

export default Snake;
