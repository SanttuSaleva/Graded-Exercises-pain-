const prompts = require('prompts');

//make parent classes for the different spaces and creatures in the dungeon
//create a storage for the different chambers, which will then be checked
class Dungeon {
  constructor(){
       this.chamberArray =[];
      }
      //a function with which to check the current room
      playersChamber(){
        let currentChamber = [];
        //loop through rooms to check where the player is 
        for(let i = 0; i < this.chamberArray.length; i++) {
          if(this.chamberArray[i].playerHere == true) {
            currentChamber = this.chamberArray[i]
            i = this.chamberArray.length
          }
        }
        return currentChamber;
      }
      //a method with which to add chambers to the dungeon is needed
      addChambers(){
        for(let i = 0; i < arguments.length; i++) {
          this.chamberArray.push(arguments[i]);
        }
      }
}

//Chamber class grants us the base from which the names and features of different spaces can be derived
class Chamber {
  constructor(name, features){
    this.name = name;
    this.features = features;
    //the child chambers also require a way to store the characters, as well as different connections between the other spaces
    this.characters = new Array();
    this.chamberConnection = new Array();
    //we also need a way to see if the player is in what chamber, so we give the parent space the distinction of a room without the player so nothing is confused 
    this.playerHere = false;
  }
  //method for creating connection between chambers
  createConnection(chamber){
    this.chamberConnection.push(chamber);  
  }
  //then for removing them as the player moves between spaces
  deleteConnection(chamber){
    let index = this.roomConnection.indexOf(chamber);
    this.chamberConnection.splice(index, 1);
  }

  //method for gaining the name and the features of the chamber
  getChamberName(){return this.name};
  getChamberFeatures(){return this.features};

  //in addition there needs to be a way to add the different characters to these different chambers
  addCharacter(character){this.characters.push(character)};
  //same with removing them, just copying the way to remove the chambers
  deleteCharacter(character){
    let index = this.characters.indexOf(character);
    this.characters.splice(index, 1);
  }
  returnCharacter(){return this.characters} 
  
  //this is the way different characters get to attack each other
  scanAndAttackVictim(victim) {
    //loop through characters in the room
    for (let i = 0; i < this.characters.length; i++) {
      if(this.characters[i]) {
        let character = this.characters[i]
        character.attackVictim(victim)
      }
    }
  }
}



//create a storage for different characters in the game and use it as a base from which to derive their statistics
//also have a boolean to check for whether the character is dead or not
class Character {
  constructor(hitPoints, attackDamage, attackChance, characterName) {
    this.hitPoints = hitPoints;
    this.attackDamage = attackDamage;
    this.attackChance = attackChance;
    this.characterName = characterName;
    this.knockedDown = false;
  }
  //all characters need a way for their hp to increase or decrease, so a method is needed
  //the method needs to be open ended so it can receive the lost/gained value depending on the attack damage of the attacker
  hpUp(hp) {this.hitPoints += hp};
  hpDown(hp) {this.hitPoints -= hp};
  //then we require the way to check if an attack hits or not
  attackVictim(victim) {if (Math.random() <= this.attackChance / 100 ) { 
    victim.hpDown(this.attackDamage);
    console.log(this.characterName + ' attack hits for ' + this.attackDamage);

    //if the victim is reduced below zero hp or not

    if(victim.hitPoints <= 0){
      console.log(victim.characterName + ' is slain by ' + this.characterName)
      victim.knockedDown = true;
    } else {
      console.log(this.characterName + ' strikes ' + victim.characterName + ' for ' + this.attackDamage + '. ' + 'They have ' + victim.hitPoints + ' remaining!')}
 
      //if the attack does not land  
    } else {
      console.log(victim.characterName + " dodged the attack by " + this.characterName);
  }}
}
 

//create a class for the player character
class Player extends Character {
  constructor(hitPoints, attackDamage, attackChance, characterName){
    super(hitPoints, attackDamage, attackChance, characterName)
  }
}

//create a class for the different enemies
class Enemy extends Character {
  constructor(hitPoints, attackDamage, attackChance, characterName){
    super(hitPoints, attackDamage, attackChance, characterName);
  }
}
//create the different spaces of the dungeon
let dungeonEntrance = new Chamber("Dungeon Entrance", 
 "Light trickling down from the stairway reveals an empty entrance space. You can see a dark hallway before you.");

 let hallway = new Chamber("Hallway",
 "Rat droppings have accumulated in at the sides of the hallway. The hallway seems to open up further ahead. You can hear the rumbling breathing of a great beast there...");

 let chamber = new Chamber("Chamber",
 "You stand in an expansive chamber, with piles of gold set neatly at the center. A blue-hued portal at the other side paints the space with an ominous glow.");

 let portal = new Chamber("Portal",
 "You feel yourself being pulled away");

 let dungeon = new Dungeon;
 dungeon.addChambers(dungeonEntrance, hallway, chamber, portal);

//create the different characters
let player = new Player(10, 2, 75, "Adventurer");

let sewerRat = new Enemy(2, 1, 50, "Sewer Rat");

let giantDragon = new Enemy(4, 8, 90, "Giant Dragon");

//now we need the interconnected rooms to be stated, along with the placement of the different characters

dungeonEntrance.createConnection(hallway)
hallway.createConnection(dungeonEntrance)
hallway.createConnection(chamber)
chamber.createConnection(hallway)
chamber.createConnection(portal)
portal.createConnection(chamber)
//since entering the portal must end the game, it needs to trigger the condition to end the gameplay loop
portal.finalChamber = true

//player needs to placed at the start of the dungeon 
dungeonEntrance.playerHere = true
hallway.addCharacter(sewerRat)
chamber.addCharacter(giantDragon)


async function gameLoop() {

  //the game needs a way to identify that it is supposed to continue, simple boolean suffices
  let showMustGoOn = true;

    const initialActionChoices = [
        { title: 'Look around', value: 'look' },
        { title: 'Go to Room', value: 'goToRoom' },
        { title: 'Attack', value: 'attack'},
        { title: 'Exit game', value: 'exit'}
    ];

    const response = await prompts({
      type: 'select',
      name: 'value',
      message: 'Choose your action',
      choices: initialActionChoices
    });
     //here we deal with the selected option
    console.log('You selected ' + response.value);
    switch (response.value) {

      case 'look': 
      playersChamber = dungeon.playersChamber()
      console.log(playersChamber.getChamberFeatures());
      break;

      case 'goToRoom': 
      
      playersChamber = dungeon.playersChamber()

      const decideChamber = await prompts({
        type: 'select',
        name: 'chosenChamber',
        message: 'Choose next chamber',
        choices: playersChamber.chamberConnection.map(function(chamber) {
          //this transforms the chamber into an array of objects with its and the room itself as a value, feels like a contrived way to do it but it works
          let object = { title: chamber.name, value: chamber}
          return object
        })   
      });
    
      //then the player must be checked off from the previous chamber and checked in to the next chamber by changing the attribute from both
      playersChamber.playerHere = false;
      decideChamber.chosenChamber.playerHere = true;
      //then we recheck where the player is and update the position
      playersChamber = dungeon.playersChamber();
      //make the monster in the room attack the player 
      playersChamber.scanAndAttackVictim(player)
      break;

      case 'attack': 
      //again check the space that the player is initialActionChoices
      playersChamber = dungeon.playersChamber()
      let attackableCharacters = playersChamber.characters.map(function(character) {
        let object = { title: character.name, value: character}
        return object
      })

      if (attackableCharacters.length > 0){
        const characterSelection = await prompts ({
          type: 'select',
          name: 'selectedCharacter',
          message: 'Choose a character to attack',
          choices: attackableCharacters
      })
      player.attackVictim(characterSelection.selectedCharacter)

      if(characterSelection.selectedCharacter.knockedDown == true) {playersChamber.deleteCharacter(characterSelection.selectedCharacter)}
      } else {console.log("You strike the empty air with your blade")}
      break;

      case 'exit': showMustGoOn = false;
      break;
    }
  //a method to check if the player is dead or not, leading to game end 
  if(player.knockedDown == true || dungeon.playersChamber().finalChamber == true)
    showMustGoOn = false;
   
  if(showMustGoOn) {
    gameLoop();
  }
}

process.stdout.write('\033c'); // clear screen on windows

console.log('WELCOME TO THE DUNGEON OF --wait, what was the name again?')
console.log('================================================')
console.log('You walk down the stairs to the dungeons')
gameLoop();