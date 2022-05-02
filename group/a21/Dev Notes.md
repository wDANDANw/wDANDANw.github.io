# Development Notes and Considerations for Experimenting MAS Implementation in Perlenspiel Engine

### Basic Info
Author: Raphael Liu
Date: April 20th 2022

### Notes
#### Current Version:
  - Only support conditional predicate action of 
    - Keyboard of {UP(W), LEFT(A), DOWN(S), RIGHT(D), SPACE}
    - Collision of two agents. 
      - However, I really worry about the collision system. See more at [Concerns of Collision System](#Concerns of Collision System)

#### Current Approach:
- First, I will write the predicates in the level file, in the prefabs of the actors.

#### Need for Precise Update
  - Since perlenspiel is a bead / grid based engine, then each frame is very important.
    - If one bead has an update that is being updated in the next frame but not the current frame, then there might be issues
    
#### Concerns of Collision System
- I have implemented the collision using "predicting geometry based on kinematics".
  - However, geometry is no longer easy-predictable when there are user-created rules.
  - We do not know that if one rule will get executed or not. Therefore, we cannot give out a good prediction.
  - If there is not a good prediction, then collision may fail.

#### Thoughts
- relationship with the behavior system
- priority in updates: kinematics > behavior (first behavior update, then kinematic update)
- concretization and our position


### For each is very dangerous
- For each is runned in parallel
- Therefore, it might break program flow
