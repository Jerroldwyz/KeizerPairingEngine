/**
 * Reference to business document:
 * https://docs.google.com/document/d/10H_l5gFt-NJk-jtQHTpYwPzMVda_vOlQbXjDhwSFeAY/edit#
 * 
 */

import { promises as fsPromises, writeFileSync } from "fs";
import { join } from 'path';

/**
 * The class of a Player in the chess tournament
 */
class Player {
    startingRank: number; 
    points: number; 
    rank: number; 
    keizerScore: number; 
    keizerValue: number;
    colorAllocation: string[];
    colorScore: number;
    opponentSeed: number[];
    roundResult: string[];
    paired: boolean
    absent: boolean

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
        this.colorScore = 0;
        this.opponentSeed = [];
        this.roundResult = [];
        this.paired = false;
        this.absent = false;
    }
}

/**
 * The possible match outcomes
 */
enum matchOutcome {
    win = '1',
    lose = '0',
    draw = '=',
    pairingAllocatedBye = 'U'
}

/**
 * The colors a player can be assigned to
 */
enum color{
    black = 'b',
    white = 'w'
}

/**
 * Used as boolean flags for each rule to be discarded or not
 */
const discardRules = {
    rule2: 0,
    rule3: 0,
    rule4: 0
}

var totalNumberOfRounds = 1; // base case: number of round == 1
var currentNumOfRounds = 0;  // A competition can have say 7 rounds but this would store the current round of it
var absentPlayers: number[] = [];

/**
 * Writes the data to an output file of extension .txt
 * 
 * @param filename The name of the file. Format: './filename.extension', '../folder/filename.extension'
 * @param data String to be used as output
 */
function syncWriteFile(filename: string, data: any){
    writeFileSync(join(__dirname, filename), data, {
        flag: 'w'
    })
}

/**
 * This function reads the TRFx file asynchronously without blocking the thread
 * and splits the file to retrieve useful lines.
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
 * Extracts the data from useful lines of the TRFx File such as the round number and player's meta data
 * 
 * @param TRFxFileSplit The lines of useful data from @asyncReadFile
 * @param playersArray An array of Player objects with their data.
 */
function DataExtraction(TRFxFileSplit: string[], playersArray: Player[]){
    for (let row = 0; row < TRFxFileSplit.length; row++){

        RoundsExtraction(TRFxFileSplit, row);

        AbsenceExtraction(TRFxFileSplit, row);

        PlayerDataExtraction(TRFxFileSplit, row, playersArray);

    }
}

/**
 * Extracts the players who are absent for the current round
 * 
 * @param TRFxFileSplit The lines of useful data from @asyncReadFile
 * @param row The row in which stores the total number of rounds in the tournament
 */
function AbsenceExtraction(TRFxFileSplit: string[], row: number){
    if(TRFxFileSplit[row].substring(0,3) == 'XXZ'){ // XXZ represents the players skipping th round
        let result = TRFxFileSplit[row].split(" ")
        for(let i = 1; i < result.length; i++){
            absentPlayers.push(+result[i]);
        }
    }
}

/**
 * Extracts the current round number and stores it in @totalNumberOfRounds
 * 
 * @param TRFxFileSplit The lines of useful data from @asyncReadFile
 * @param row The row in which stores the total number of rounds in the tournament
 */
function RoundsExtraction(TRFxFileSplit: string[], row: number){
    if(TRFxFileSplit[row].substring(0,3) == 'XXR'){ // XXR represents the number of round played in tournament
        if(TRFxFileSplit[row][5] != undefined){
            totalNumberOfRounds = +(TRFxFileSplit[row][4] + TRFxFileSplit[row][5]); // element at index [4] is always the number of round (following the TRF documentation)
        }else{
            totalNumberOfRounds = +TRFxFileSplit[row][4]
        }
    }
}

/**
 * Extracts all player data 
 * 
 * @param TRFxFileSplit The lines of useful data from @asyncReadFile
 * @param row The row in which stores the meta data of the player
 * @param playersArray An array of Player objects with their data.
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
 * Extracts the match history of a player
 * 
 * @param TRFxFileSplit The lines of useful data from @asyncReadFile
 * @param row The row in which stores the meta data of the player
 * @param player The current iteration of player 
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
 * This function is the main function of the algorithm. It calls many other sub-functions to in the end create
 * pairs of players to be matched against each other.
 * 
 * @param filename - The name of the file. Format: './filename.extension', '../folder/filename.extension'
 * @returns Returns void but should write pairings into an external text file.
 */
async function KeizerPairing(filename: string): Promise<void> {
    
    // calls the asyncReadFile function to receive sanitised file (players data only)
    let playersArray: Player[] = await asyncReadFile(filename); 

    for(let i = 0; i < absentPlayers.length; i++){
        playersArray[absentPlayers[i]-1].absent = true;
    }

    for(let round = 1; round <= currentNumOfRounds; round++){

        AssignKeizerValue(playersArray);

        SortByStartingRank(playersArray);
        
        CalculateKeizerScore(playersArray, round);
        
        SortByKeizerScore(playersArray);
        
    }

    for(let i = 0; i < absentPlayers.length; i++){
        playersArray.pop()
    }

    PlayerPairing(playersArray);

}

/**
 * Calculates the Keizer value to be assigned to the bottom ranked player such that the top ranked player's
 * Keizer value is approximately 3 times the bottom ranked player
 * 
 * @param playersArray An array of Player objects with their data.
 */
function AssignKeizerValue(playersArray: Player[]){
    let bottomKeizerValue = Math.floor((playersArray.length - absentPlayers.length)/2);
    for(let i = playersArray.length-1; i >= 0; i--){ 
        if(!playersArray[i].absent){
            playersArray[i].keizerValue = bottomKeizerValue;
            bottomKeizerValue++;
        }
    }
}

/**
 * A simple sort algorithm to sort the players in the players array based on starting rank
 * 
 * @param playersArray An array of Player objects with their data.
 */
function SortByStartingRank(playersArray: Player[]){
    playersArray.sort(
        (player1, player2) => (player1.startingRank > player2.startingRank) ? 1 : (player1.startingRank < player2.startingRank) ? -1 : 0
    );
}

/**
 * Calculates the keizer score of a player based on the results of the match in the current round
 * 
 * @param playersArray An array of Player objects with their data.
 * @param round The current iteration of round being calculated 
 */
function CalculateKeizerScore(playersArray: Player[], round: number){
    for(let index = 0; index < playersArray.length; index++){
        if(!playersArray[index].absent){
            let player: Player = playersArray[index] 
            player.keizerScore = player.keizerValue;
            for(let i = 0; i < round; i++){
                let opponent: Player = playersArray[player.opponentSeed[i]-1]
                switch(player.roundResult[i]){
                    case matchOutcome.win:
                        player.keizerScore += opponent.keizerValue;
                        break;
                    case matchOutcome.lose:
                        player.keizerScore += 0;
                        break;
                    case matchOutcome.draw:
                        player.keizerScore += (opponent.keizerValue/2);
                        break;
                    case matchOutcome.pairingAllocatedBye:
                        player.keizerScore = player.keizerScore * 2;
                        break;
                }
            }
        }
    }
}

/**
 * A simple sort algorithm to sort the players in the players array based on keizer score
 * 
 * @param playersArray An array of Player objects with their data.
 */
function SortByKeizerScore(playersArray: Player[]){
    playersArray.sort(
        (player1, player2) => (player1.keizerScore < player2.keizerScore) ? 1 : (player1.keizerScore > player2.keizerScore) ? -1 : 0
    );
}

/**
 * Pairs the players up based on their ranking of Keizer score and value. The matchup should always be as
 * interesting as possible. Hence, the top ranked player would go against the second ranked player. If it is
 * not possible due to rules restriction then top ranked player would player against third ranked player.
 * 
 * Output is always White then Black. Eg: 1 2 means player 1 is white and player 2 is black
 * 
 * @param playersArray An array of Player objects with their data.
 */
function PlayerPairing(playersArray: Player[]){
    let matchupArray : Player[][] = [];

    if(playersArray.length%2 === 0){
        for(let i = 0; i < playersArray.length; i++){
            if(!playersArray[i].paired){
                if(tryMatchUp(playersArray[i], playersArray[i+1])){
                    matchupArray.push([playersArray[i], playersArray[i+1]]);
                }else{ 
                    if(!tryNext(playersArray, matchupArray, i)){
                        if(!rePair(playersArray, matchupArray, i)){
                            discardRules.rule4 = 1
                            if(!tryNext(playersArray, matchupArray, i)){
                                if(!rePair(playersArray, matchupArray, i)){
                                    discardRules.rule3 = 1
                                    if(!tryNext(playersArray, matchupArray, i)){
                                        if(!rePair(playersArray, matchupArray, i)){
                                            discardRules.rule2 = 1
                                            tryNext(playersArray, matchupArray, i)
                                        }
                                    }
                                }
                            }
                        }
                    }  
                }
            }
        }
    }else if(playersArray.length%2 === 1){
        let bye: Player = new Player()
        for(let i = 0; i < playersArray.length; i++){
            if(!playersArray[i].paired){
                if(i === playersArray.length - 1 || playersArray[playersArray.length - 1].paired){ 
                    if(!sameBye(playersArray[i])){
                        matchupArray.push([playersArray[i], bye]);
                    }else{
                        let breakPair: Player[] = breakNextPair(matchupArray);
                        if(tryMatchUp(breakPair[1], playersArray[i])){
                            matchupArray.push([breakPair[1], playersArray[i]])
                            matchupArray.push([breakPair[0], bye])
                        }else if(tryMatchUp(breakPair[0], playersArray[i])){
                            matchupArray.push([breakPair[0], playersArray[i]])
                            matchupArray.push([breakPair[1], bye])
                        }
                    }

                }else{
                    if(tryMatchUp(playersArray[i], playersArray[i+1])){
                        matchupArray.push([playersArray[i], playersArray[i+1]]);
                    }else{ 
                        if(!tryNext(playersArray, matchupArray, i)){
                            if(!rePair(playersArray, matchupArray, i)){
                                discardRules.rule4 = 1
                                if(!tryNext(playersArray, matchupArray, i)){
                                    if(!rePair(playersArray, matchupArray, i)){
                                        discardRules.rule3 = 1
                                        if(!tryNext(playersArray, matchupArray, i)){
                                            if(!rePair(playersArray, matchupArray, i)){
                                                discardRules.rule2 = 1
                                                tryNext(playersArray, matchupArray, i)
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    let output = Math.ceil(playersArray.length/2) + "\n";

    colorPreferenceSort(matchupArray)

    for(let i = 0; i < matchupArray.length; i++){
        output += matchupArray[i][0].startingRank + " " + matchupArray[i][1].startingRank + "\n"
    }

    syncWriteFile('../output/output.txt', output)

}

/**
 * Sorts the player in the output based on player who gets the color preference 
 * 
 * @param matchupArray An array that consists of the match up pairing of players
 */
function colorPreferenceSort(matchupArray: Player[][]): void{
    for(let i = 0; i < matchupArray.length; i++){
        let player1: Player = matchupArray[i][0];
        let player2: Player = matchupArray[i][1];
        let preferencePlayer: Player = player1;
        let secondPreference: Player = player2;

        if(Math.abs(player1.colorScore) < Math.abs(player2.colorScore)){
            preferencePlayer = player2;
            secondPreference = player1;
        }else if(player1.colorScore === player2.colorScore){
            let p1ColorScore: number = 0;
            let p1ColorArray: String[] = player1.colorAllocation;
            let p1LastTwoRounds: String[] = [p1ColorArray[p1ColorArray.length-1], p1ColorArray[p1ColorArray.length-2]];
            for(let i = 0; i < p1LastTwoRounds.length; i++){
                switch(p1LastTwoRounds[i]){
                    case color.black:
                        p1ColorScore--;
                        break;
                    case color.white:
                        p1ColorScore++;
                        break;
                }
            }

            let p2ColorScore: number = 0;
            let p2ColorArray: String[] = player2.colorAllocation;
            let p2LastTwoRounds: String[] = [p2ColorArray[p2ColorArray.length-1], p2ColorArray[p2ColorArray.length-2]];
            for(let i = 0; i < p2LastTwoRounds.length; i++){
                switch(p2LastTwoRounds[i]){
                    case color.black:
                        p2ColorScore--;
                        break;
                    case color.white:
                        p2ColorScore++;
                        break;
                }
            }

            if(Math.abs(p1ColorScore) < Math.abs(p2ColorScore)){
                preferencePlayer = player2;
                secondPreference = player1;
            }else if(p1ColorScore === p2ColorScore){
                if(player1.keizerValue < player2.keizerValue){
                    preferencePlayer = player2;
                    secondPreference = player1;
                }
            }
        }

        if(preferencePlayer.colorScore === 0){
            let lastRound: String = preferencePlayer.colorAllocation[preferencePlayer.colorAllocation.length - 1]
            if(lastRound === 'w'){
                matchupArray[i][1] = preferencePlayer;
                matchupArray[i][0] = secondPreference;
            }else if(lastRound === 'b'){
                matchupArray[i][0] = preferencePlayer;
                matchupArray[i][1] = secondPreference;
            }
        }else{
            matchupArray[i][0] = preferencePlayer;
            matchupArray[i][1] = secondPreference;
        }
    }
}

/**
 * The first rule of pairing. 
 * A player cannot be paired against a bye 3 times in a row.
 * 
 * @param player The current player being iterated
 * @returns A boolean to depict whether the player has been the same bye for 2 consective rounds or not
 */
function sameBye(player: Player): boolean{
    if(player.roundResult[-1] === "U" && player.roundResult[-2] === "U"){
        return true
    }
    return false
}

/**
 * This function tries a matchup between two players taken in as parameters.
 * If no rules are broken, they can be paired against each other.
 * 
 * @param player1 The first player 
 * @param player2 The second player
 * @returns A boolean whether the match up is successful or not
 */
function tryMatchUp(player1: Player, player2: Player, ): boolean{
    if(!player1.paired && !player2.paired){
        if(discardRules.rule2 || !sameOpponent(player1, player2)){
            if(discardRules.rule3 || !sameColourHistory(player1, player2)){
                if(discardRules.rule4 || !sameColourScore(player1, player2)){
                    player1.paired = true
                    player2.paired = true
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * Second rule of pairing.
 * A player cannot play against the same player 3 times in a row.
 * 
 * @param player1 The first player
 * @param player2 The second player
 * @returns A boolean whether the players have played against each other consecutively
 */
function sameOpponent(player1: Player, player2: Player): boolean{
    let playerOpponentList: number[] = player1.opponentSeed;
    let length: number = playerOpponentList.length;

    if(playerOpponentList[length-1] === playerOpponentList[length-2]){
        if(playerOpponentList[length-1] === player2.startingRank){
            return true
        }
    }
    return false
}

/**
 * The third rule.
 * Two players must not have the same colour history as they cannot play the same colour 3 games in a row.
 * 
 * @param player1 The first player
 * @param player2 The second player
 * @returns A boolean on whether the colour history of the players are the same
 */
function sameColourHistory(player1: Player, player2: Player): boolean{
    let p1ColorList: string[] = player1.colorAllocation;
    let p2ColorList: string[] = player2.colorAllocation;
    let p1Listlength = p1ColorList.length;
    let p2Listlength = p2ColorList.length;

    if(p1ColorList[p1Listlength-1] === p1ColorList[p1Listlength-2]){
        if(p2ColorList[p2Listlength-1] === p1ColorList[p1Listlength-1] && 
            p2ColorList[p2Listlength-2] === p1ColorList[p1Listlength-2]){
                return true
        }
    }
    return false
}

/**
 * The fourth rule.
 * Two players must not have the same colour score balance of 2 or -2.
 * 
 * Everytime a player plays as a White, the colour balance increase by 1.
 * Everytime a player plays as a Black, the colour balance decrease by 1.
 * 
 * @param player1 The first player
 * @param player2 The second player
 * @returns A boolean on whether the two players have the same colour score 
 */
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

    player1.colorScore = p1ColorScore;

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

    player2.colorScore = p2ColorScore;

    if(p1ColorScore === p2ColorScore){
        if(p1ColorScore >= 2 || p1ColorScore <= -2){
            return true
        }
    }

    return false
}

/**
 * Tries the next possible opponent of any given player, iterating down the list of playersArray.
 * 
 * @param playersArray An array of Player objects with their data.
 * @param matchupArray An array that consists of the match up pairing of players
 * @param i The current index of the player in playersArray
 * @returns A boolean of whether any matchups are possible
 */
function tryNext(playersArray: Player[], matchupArray: Player[][], i: number): boolean{
    let nextTry: number = i+2;
    //trying downwards
    for(nextTry; nextTry < playersArray.length; nextTry++){
        if(tryMatchUp(playersArray[i], playersArray[nextTry])){
            matchupArray.push([playersArray[i], playersArray[nextTry]]);
            playersArray[i].paired = true;
            playersArray[nextTry].paired = true;
            return true;
        }
    }
    return false;
}

/**
 * A recursion function of trying matchups, iterating upwards the list of playersArray.
 * Breaking pairs as neccessary to look for a suitable matchup.
 * 
 * @param playersArray An array of Player objects with their data.
 * @param matchupArray An array that consists of the match up pairing of players
 * @param end The last index of player needed to iterate to cut a few iterations
 * @returns A boolean on whether a matchup is found 
 */
function recursionPairing(playersArray: Player[], matchupArray: Player[][], end: number): boolean{
    //break next pair
    let brokenPair: Player[] = breakNextPair(matchupArray)
    if(brokenPair === undefined){
        return false;
    }
    
    let i: number = playersArray.indexOf(brokenPair[1]) + 1;
    
    while(matchupArray.length != Math.ceil(end/2)){
        for(i; i <= end; i++){
            for(let j = 0; j < brokenPair.length; j++){
                if(tryMatchUp(brokenPair[j], playersArray[i])){
                    matchupArray.push([brokenPair[j], playersArray[i]]);
                }
            }
        }
        let remainingPlayers: Player[] = [];
        for(let k = 0; k < end; k++){
            if(!playersArray[k].paired){
                remainingPlayers.push(playersArray[k]);
            }
        }
        if(remainingPlayers.length%2 === 0){
            for(let x = 0; x < remainingPlayers.length; x+2){
                if(tryMatchUp(remainingPlayers[x], remainingPlayers[x+1])){
                    matchupArray.push([remainingPlayers[x], remainingPlayers[x+1]]); //this should satisfy while loop
                }else{
                    recursionPairing(playersArray, matchupArray, end)
                }
            }    
        }
    }
    return true;
}

/**
 * Pops the last element from matchupArray to be stored in brokenPair
 * 
 * @param matchupArray An array that consists of the match up pairing of players
 * @returns A couple of player that was formerly a pair, broken to be tried for other pairings
 */
function breakNextPair(matchupArray: Player[][]): Player[]{
    let brokenPair: Player[] = matchupArray[matchupArray.length-1];
    brokenPair[0].paired = false;
    brokenPair[1].paired = false;
    matchupArray.pop();
    return brokenPair;
}

/**
 * This function starts the chain of re-pairing players when no suitable matchups are found iterating down the list
 * of playersArray.
 * 
 * @param playersArray An array of Player objects with their data.
 * @param matchupArray An array that consists of the match up pairing of players
 * @param i Current iteration of player in playersArray
 * @returns A boolean on whether a matchup is found 
 */
function rePair(playersArray: Player[], matchupArray: Player[][], i: number): boolean{
    let end = i+1;
    if(matchupArray.length === 0){
        return false;
    }

    let brokenPair: Player[] = breakNextPair(matchupArray)

    if(tryMatchUp(brokenPair[0], playersArray[i]) && tryMatchUp(brokenPair[1], playersArray[i+1])){
        matchupArray.push([brokenPair[0], playersArray[i]]);
        matchupArray.push([brokenPair[1], playersArray[i+1]]);
        return true;
    }else if(tryMatchUp(brokenPair[0], playersArray[i+1]) && tryMatchUp(brokenPair[1], playersArray[i])){
        matchupArray.push([brokenPair[0], playersArray[i]]);
        matchupArray.push([brokenPair[1], playersArray[i+1]]);
        return true;
    }else{
        if(recursionPairing(playersArray, matchupArray, end)){
            return true;
        }
    }

    return false;
}



//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
console.time('Execution Time');

/**
 * Calling the main function
 */
KeizerPairing("../TRFx/testing-tornelo-event--51-trf-for-pairing.trf");
// KeizerPairing("../TRFx/sample-keizer-pairing--1-trf-for-pairing.trf");
// KeizerPairing("../TRFx/david-keizer-pairing.trf");
// KeizerPairing("../TRFx/sample-keizer-pairing--2.trf");

console.timeEnd('Execution Time');
