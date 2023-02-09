import { promises as fsPromises } from "fs";
import { join } from 'path';

/**
 * 
 */
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
 * 
 */
enum matchOutcome {
    win = '1',
    lose = '0',
    draw = '=',
    pairingAllocatedBye = 'U'
}

enum color{
    black = 'b',
    white = 'w'
}

var totalNumberOfRounds = 1; // base case: number of round == 1
var currentNumOfRounds = 0; 

/**
 * This function reads the TRFx file asynchronously without blocking the thread
 * and sanitises the file to retrieve useful lines.
 * 
 * @param filename - The name of the file. Format: './filename.extension', '../folder/filename.extension'
 * @returns An array of Player objects with their data.
 */
async function asyncReadFile(filename: string) {
    try {
        const TRFxFile = 
        await fsPromises.readFile(join(__dirname, filename),'utf-8'); // _dirname is the name of the current directory this file is stored in

        const TRFxFileSplit = TRFxFile.split("\n");
        let playersArray: Player[] = [];

        DataExtraction(TRFxFileSplit, playersArray)

        return playersArray;

    } catch (err) { 
        console.log(err);
        return [];
    }
}

/**
 * TOBEIMPLEMENTED
 * @param TRFxFileSplit 
 * @param playersArray 
 */
function DataExtraction(TRFxFileSplit: string[], playersArray: Player[]){
    for (let row = 0; row < TRFxFileSplit.length; row++){

        RoundsExtraction(TRFxFileSplit, row);

        PlayerDataExtraction(TRFxFileSplit, row, playersArray);

    }
}

/**
 * TOBEIMPLEMENTED
 * @param TRFxFileSplit 
 * @param row 
 */
function RoundsExtraction(TRFxFileSplit: string[], row: number){
    if(TRFxFileSplit[row].substring(0,3) == 'XXR'){ // XXR represents the number of round played in tournament
        totalNumberOfRounds = +TRFxFileSplit[row][4]; // element at index [4] is always the number of round (following the TRF documentation)
    }
}

/**
 * TOBEIMPLEMENTED
 * @param TRFxFileSplit 
 * @param row 
 * @param playersArray 
 */
function PlayerDataExtraction(TRFxFileSplit: string[], row: number, playersArray: Player[]){
    if(TRFxFileSplit[row].substring(0,3) === '001'){
        let player: Player = new Player();
        
        player.startingRank = +TRFxFileSplit[row].substring(4,8);
        player.points = +TRFxFileSplit[row].substring(80, 84);
        player.rank = +TRFxFileSplit[row].substring(85, 89);
        
        MatchDataExtraction(TRFxFileSplit, row, player)

        playersArray.push(player);
    }
}

/**
 * TOBEIMPLEMENTED
 * @param TRFxFileSplit 
 * @param row 
 * @param player 
 */
function MatchDataExtraction(TRFxFileSplit: string[], row: number, player: Player){
    let opponentIndex: number = 91; // opponent seed until index 94 (substring is exclusive of end)
    let colorIndex: number = 96;
    let resultIndex: number = 98;

    for(let round = 0; round < totalNumberOfRounds; round++){
        // stops the for loop earlier when it has reached the latest round
        if(typeof TRFxFileSplit[row][opponentIndex] === 'undefined'){
            currentNumOfRounds = round;
            break;
        }

        player.opponentSeed.push(+TRFxFileSplit[row].substring(opponentIndex, opponentIndex + 4));
        player.colorAllocation.push(TRFxFileSplit[row][colorIndex]);
        player.roundResult.push(TRFxFileSplit[row][resultIndex]);

        opponentIndex += 10;
        colorIndex += 10;
        resultIndex += 10;
    }
}

/**
 * This function is incomplete, but it should encompass the algorithm for the Keizer pairing system.
 * 
 * @param filename - The name of the file. Format: './filename.extension', '../folder/filename.extension'
 * @returns Returns void but should write pairings into an external text file.
 */
async function KeizerPairing(filename: string): Promise<void> {
    
    // calls the asyncReadFile function to receive sanitised file (players data only)
    let playersArray = await asyncReadFile(filename); 
    console.log(currentNumOfRounds)
    
    for(let round = 1; round <= currentNumOfRounds; round++){

        AssignKeizerValue(playersArray)

        SortByStartingRank(playersArray)

        // for printing purposes
        // for(let i = 0; i < playersArray.length; i++){
        //     console.log(playersArray[i]);
        //     console.log(playersArray[i].startingRank);
        //     console.log(playersArray[i].opponentSeed);
        //     console.log(playersArray[i].colorAllocation);
        //     console.log(playersArray[i].roundResult);
        //     console.log(playersArray[i].keizerValue);
        // }

        CalculateKeizerScore(playersArray, round)

        SortByKeizerScore(playersArray)

    }

    PlayerPairing(playersArray);

}

/**
 * TOBEIMPLEMENTED
 * @param playersArray 
 */
function AssignKeizerValue(playersArray: Player[]){
    let bottomKeizerValue = Math.floor(playersArray.length/2);
    for(let i = playersArray.length-1; i >= 0; i--){ 
        playersArray[i].keizerValue = bottomKeizerValue;
        bottomKeizerValue++;
    }
}

/**
 * TOBEIMPLEMENTED
 * @param playersArray 
 */
function SortByStartingRank(playersArray: Player[]){
    playersArray.sort(
        (player1, player2) => (player1.startingRank > player2.startingRank) ? 1 : (player1.startingRank < player2.startingRank) ? -1 : 0
    );
}

/**
 * TOBEIMPLEMENTED
 * @param playersArray 
 * @param round 
 */
function CalculateKeizerScore(playersArray: Player[], round: number){
    for(let index = 0; index < playersArray.length; index++){
        let player: Player = playersArray[index] 
        player.keizerScore = player.keizerValue;
        // console.log(round + ',' + player.keizerValue)
        for(let i = 0; i < round; i++){
            let opponent: Player = playersArray[player.opponentSeed[i]-1]
            switch(player.roundResult[i]){
                case matchOutcome.win:
                    player.keizerScore += opponent.keizerValue;
                    // console.log(round + "," + opponent.keizerValue)
                    break;
                case matchOutcome.lose:
                    player.keizerScore += 0;
                    // console.log(round + "," + 0)
                    break;
                case matchOutcome.draw:
                    player.keizerScore += (opponent.keizerValue/2);
                    // console.log(round + "," + opponent.keizerValue/2)
                    break;
                case matchOutcome.pairingAllocatedBye:
                    player.keizerScore = player.keizerScore * 2;
                    // console.log(round + "," + player.keizerScore)
                    break;
            }
        }
        console.log(player.keizerScore)
    }
}

/**
 * TOBEIMPLEMENTED
 * @param playersArray 
 */
function SortByKeizerScore(playersArray: Player[]){
    playersArray.sort(
        (player1, player2) => (player1.keizerScore < player2.keizerScore) ? 1 : (player1.keizerScore > player2.keizerScore) ? -1 : 0
    );
}

/**
 * TOBEIMPLEMENTED
 * output is always W B
 * @param playersArray 
 */
function PlayerPairing(playersArray: Player[]){

    let matchupArray : Player[][] = [];
    console.log(Math.ceil(playersArray.length/2));

    if(playersArray.length%2 === 0){
        for(let i = 0; i < playersArray.length; i += 2){
            //regular pairing
            if(tryMatchUp(playersArray[i], playersArray[i+1])){
                matchupArray.push([playersArray[i], playersArray[i+1]]);
            }else{ //do re-pair
                
            }
        }
    }else if(playersArray.length%2 === 1){
        let bye: Player = new Player()
        for(let i = 0; i < playersArray.length; i += 2){
            if(i === playersArray.length - 1){ 
                if(!sameBye){
                    matchupArray.push([playersArray[i], bye]);
                }else{ // do re-pair
                    
                }
            }else{
                //regular pairing
                if(tryMatchUp(playersArray[i], playersArray[i+1])){
                    matchupArray.push([playersArray[i], playersArray[i+1]]);
                }else{ //do re-pair
                    
                }
            }
        }
    }

    for(let i = 0; i < matchupArray.length; i++){
        console.log(matchupArray[i][0].startingRank + " " + matchupArray[i][1].startingRank);
    }
}

function sameBye(player: Player): boolean{
    if(player.roundResult[-1] === "U" && player.roundResult[-2] === "U"){
        return true
    }
    return false
}

function tryMatchUp(player1: Player, player2: Player): boolean{
    if(!sameOpponent(player1, player2)){
        if(!sameColourHistory(player1, player2)){
            if(!sameColourScore(player1, player2)){
                return true;
            }
        }
    }
    return false;
}

function sameOpponent(player1: Player, player2: Player): boolean{
    if(player1.opponentSeed[player1.opponentSeed.length-1] === player1.opponentSeed[player1.opponentSeed.length-2]){
        if(player1.opponentSeed[player1.opponentSeed.length-1] === player2.startingRank){
            console.log(player2.startingRank)
            return true
        }
    }
    return false
}

function sameColourHistory(player1: Player, player2: Player): boolean{
    if(player1.colorAllocation[player1.colorAllocation.length-1] === player1.colorAllocation[player1.colorAllocation.length-2]){
        if(player2.colorAllocation[player2.colorAllocation.length-1] === player1.colorAllocation[player1.colorAllocation.length-1] && 
            player2.colorAllocation[player2.colorAllocation.length-2] === player1.colorAllocation[player1.colorAllocation.length-2]){
                return true
        }
    }
    return false
}

function sameColourScore(player1: Player, player2: Player){
    let p1ColorScore: number = 0;
    let p2ColorScore: number = 0;

    for(let i = 0; i < player1.colorAllocation.length; i++){
        switch(player1.colorAllocation[i]){
            case color.black:
                p1ColorScore--;
                break;
            case color.white:
                p1ColorScore++;
                break;
        }
    }

    for(let i = 0; i < player2.colorAllocation.length; i++){
        switch(player2.colorAllocation[i]){
            case color.black:
                p2ColorScore--;
                break;
            case color.white:
                p2ColorScore++;
                break;
        }
    }

    if(p1ColorScore === p2ColorScore){
        if(p1ColorScore === 2 || p1ColorScore === -2){
            return true
        }
    }

    return false
}

// function rePair(){

// }

// KeizerPairing("../TRFx/sample-keizer-pairing--1.trf");
KeizerPairing("../TRFx/david-keizer-pairing.trf");


