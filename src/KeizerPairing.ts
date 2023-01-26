import { promises as fsPromises } from "fs";
import { join } from 'path';

class Player {
    startingRank: number; 
    points: number; 
    rank: number; 
    keizerScore: number; 
    keizerValue: number;
    colorAllocation: string[];
    opponentSeed: number[];
    roundResult: string[];

    // OPTIONAL
    // sex: string;
    // title: string;
    // firstName: string;
    // lastName: string;
    // ratingFIDE: number;
    // federationFIDE: number;
    // numberFIDE: number;
    // birthDate: string;

    constructor(){
        this.startingRank = 0; 
        this.points = 0; 
        this.rank = 0; 
        this.keizerScore = 0;
        this.keizerValue = 0;
        this.colorAllocation = [];
        this.opponentSeed = [];
        this.roundResult = [];
    }
}

/**
 * This function reads the TRFx file asynchronously without blocking the thread
 * and sanitises the file to retrieve useful lines.
 * 
 * @param filename - The name of the file. Format: './filename.extension', '../folder/filename.extension'
 * @returns A string array of players and their data.
 */
async function asyncReadFile(filename: string) {
    try {
        const TRFxFile = 
        await fsPromises.readFile(join(__dirname, filename),'utf-8'); // _dirname is the name of the current directory this file is stored in

        const TRFxFileSplit = TRFxFile.split("\n");
        let numberOfRounds: number = 1; // base case: number of rounds == 1
        let playersArray: Player[] = [];

        for (let row = 0; row < TRFxFileSplit.length; row++){
            // extracting the number of rounds played in this tournament
            if(TRFxFileSplit[row].substring(0,3) == 'XXR'){ // XXR represents the number of rounds played in tournament
                numberOfRounds = +TRFxFileSplit[row][4]; // element at index [4] is always the number of rounds (following the TRF documentation)
            }

            // extracting all lines with player data
            if(TRFxFileSplit[row].substring(0,3) === '001'){
                let player: Player = new Player();
                
                player.startingRank = +TRFxFileSplit[row].substring(4,8);
                player.points = +TRFxFileSplit[row].substring(80, 84);
                player.rank = +TRFxFileSplit[row].substring(85, 89);
                
                let opponentIndex: number = 94; 
                let colorIndex: number = 96;
                let resultIndex: number = 98;

                // extracting the opponent seed & color allocation & result of each round played
                for(let round = 0; round < numberOfRounds; round++){
                    // stops the for loop earlier when it has reached the latest round
                    if(typeof TRFxFileSplit[row][opponentIndex] === "undefined"){
                        break;
                    }

                    player.opponentSeed.push(+TRFxFileSplit[row][opponentIndex]);
                    player.colorAllocation.push(TRFxFileSplit[row][colorIndex]);
                    player.roundResult.push(TRFxFileSplit[row][resultIndex]);

                    opponentIndex += 10;
                    colorIndex += 10;
                    resultIndex += 10;
                }

                playersArray.push(player);
            }
        }

        return playersArray;

    // catches the error if file read goes wrong
    } catch (err) { 
        console.log(err);
        return [];
    }
}

/**
 * This function is incomplete, but it should encompass the algorithm for the Keizer pairing system.
 * 
 * @param input - this parameter to be deprecated later on
 * @param filename - The name of the file. Format: './filename.extension', '../folder/filename.extension'
 * @returns Returns void but should write pairings into an external text file.
 */
async function KeizerPairing(filename: string): Promise<void> {
    
    // calls the asyncReadFile function to receive sanitised file (players data only)
    let playersArray = await asyncReadFile(filename); 
   
    let bottomKeizerValue = Math.floor(playersArray.length/2);
    
    // adds the base keizer value to each player data from bottom to top
    for(let i = playersArray.length-1; i >= 0; i--){ 
        playersArray[i].keizerValue = bottomKeizerValue;
        bottomKeizerValue++;
    }

    // for printing purposes
    for(let i = 0; i <= playersArray.length-1; i++){
        // console.log(playersArray[i]);
        console.log(playersArray[i].opponentSeed);
        console.log(playersArray[i].colorAllocation);
        console.log(playersArray[i].roundResult);
        console.log(playersArray[i].keizerValue);
    }

    // Calculating keizer score
    for(let index = 0; index < playersArray.length/2; index++){
        let opponent: Player = playersArray[playersArray[index].opponentSeed[0]]
        let player: Player = playersArray[index] 
        // change to enum
        if(player.roundResult[0] === '1'){ // if win
            player.keizerScore = player.keizerValue + opponent.keizerValue
        }else if(player.roundResult[0] === '='){ // if draw
            player.keizerScore = player.keizerValue + (opponent.keizerValue/2)
        }else if(player.roundResult[0] === '0'){ // if loss
            player.keizerScore = player.keizerValue + 0
        }else if(player.roundResult[0] === 'U'){ // if pairing-allocated bye
            player.keizerScore = player.keizerScore * 2
        }
        console.log(player.keizerScore)
    }

    // lodsh

    // Pairing of players
    console.log(Math.ceil(playersArray.length/2));
    for(let i = 0; i < playersArray.length; i += 2){
        if(playersArray.length%2 === 0){ // if even numbered players
            console.log(playersArray[i].startingRank, playersArray[i+1].startingRank);
        }else{ // if odd numbered players
            if(i === playersArray.length - 1){ // and it is the last element
                console.log(playersArray[i].startingRank, 0);
            }else{
                console.log(playersArray[i].startingRank, playersArray[i+1].startingRank);
            }
        }
    }
}

KeizerPairing("../TRFx/sample-keizer-pairing--1.trf");

