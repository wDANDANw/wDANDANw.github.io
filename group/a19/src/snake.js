// Snake.js

import LM from "./LevelManager.js";
import DM from "./DialogueManager.js"

/**
 * The global game configurations
 */

let food = {x: 7, y:7}


const Snake = {

    snake: [],
    x: 0,
    y: 0,
    d: "UP",
    score: 0,
    died : false,

    init : function () {
        Snake.x = 3;
        Snake.y = 11;
        Snake.snake[0] = {
            x : 3, y : 11
        }
        for ( let i = 0; i < 4 ; i++){
            Snake.snake[i] = {
                x:3, y:12 + i
            }
        }

    },

    update : function () {
        if (Snake.died) return;

        if(!LM.isLevelArea(Snake.snake[0].x, Snake.snake[0].y)){
            DM.showMessage("Snake Game Dead. Thanks for playing!");
            Snake.died = true;
            return;
        }

        PS.color(Snake.snake[0].x, Snake.snake[0].y, 158, 158, 158);
        for( let i = 1; i < Snake.snake.length ; i++){
            const x = Snake.snake[i].x;
            const y = Snake.snake[i].y;

            PS.color(x, y, 117, 117, 117)
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
            Snake.snake.pop();
        }

        // add new Head

        let newHead = {
            x : snakeX,
            y : snakeY
        }

        // game over

        if(collision(newHead,Snake.snake)){
            DM.showMessage("Snake Game Dead. Thanks for playing!");
        }

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

    const data = PS.data(x,y);
    let answer = true;

    if (!data.tags.includes("black_background")) answer = false;
    Snake.snake.forEach( coord => {
        if (coord.x === x && coord.y === y) answer = false;
    })

    return LM.isLevelArea( x , y ) && answer;

}

export default Snake;
