# The Flow Design for A12 Puzzle Prototype and Beyond

### About
This document illustrates the intended program flow of A12
For this prototype, there are still great parts of stuff that are hardcoded
However, there are plans to design and implement a universal tool for Perlenspiel

### The A12 Program
- Assumed fixed area designs - button areas, color areas, etc.
  - Hardcoded design. But will need a manager to manage and update the status
- Assumed fixed grid size
- Only changing is the levels
  - Then need a level manager
  - There are special beads in the level
    - Tags in the bead => Data => And store processing manners
    - When rendering, we only render special beads => This means, we only need to store special beads
    

### The A12 Program Flow
- Initialize: Border, Button Area
- Use the level manager to load levels
- Initialize the first level
- Use game manager to process the game => Ticks, game speed, special processing, etc.
- Player Manager / Class to handle player related



### Universal Perlenspiel Design Tool
- Users draw the levels and the designs
  - It can include special areas like buttons and borders
  - User: define new object -> draw new object
    - Object should contain details. Color, function of when touched, etc.
- Then, the tool convert the drawing to a level file
- The loader engine reads the level and store it in memory
  - There is a quick "render" function generated for each full canvas => For each bead, initialize the things

### Utilities and Tools
- Main Scene Manager
  - The Manager for Levels. Controls the switch and the initialization of levels.
  - Methods:
    - LoadScene
      - Functionality: Reads a level file and render the level
      - Flow:


- Area Manager [Temporary name]
  - The parent class of scene manager

- xx


- Game Object
  - The base class for game objects

- User Controller
  - User Avatar + User Control Related Features

- Utility:
  - Level Converter
    - Converts an image to a level file
