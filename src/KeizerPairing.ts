import { promises as fsPromises } from "fs";
import { join } from 'path';

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

        const TRFxFileSplit = TRFxFile.split("\n"); // splits the file by new lines
        let sanitisedFile: string[][] = []; // sanitisedFile is an array that contains lines that stores players data
        for(let line = 0; line < TRFxFileSplit.length; line++){
            if(TRFxFileSplit[line].substring(0,3) === '001'){ // 001 is code for player data
                sanitisedFile.push(TRFxFileSplit[line].replace(/\s+/g, ' ').split(' '));
            }
        }

        return sanitisedFile;

    } catch (err) { // catches the error if file read goes wrong
        console.log(err);
        return [['']];
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
    
    let playersArray = await asyncReadFile(filename); // calls the asyncReadFile function to receive sanitised file (players data only)
    //playersArray.push(['001', '11', 'm', 'g', 'Mirzoev,', 'Azer', '2527', 'AZE', '13400304', '1978', '4.0', '1', '26', 'w', '1', '13', 'b', '1', '8', 'w', '1', '4', 'b', '1'])
    let bottomKeizerValue = Math.floor(playersArray.length/2)
    
    for(let i = playersArray.length-1 ; i >= 0; i--){ // adds the keizer value to each player data from bottom to top
        playersArray[i].push(bottomKeizerValue.toString())
        bottomKeizerValue++;
    }

    // just for printing purposes
    for(let i = 0; i <= playersArray.length-1; i++){
        console.log(playersArray[i])
    }

    // MVP#1
    console.log(Math.ceil(playersArray.length/2));
    for(let i = 0; i < playersArray.length; i += 2){
        if(playersArray.length%2 === 0){ // if even numbered players
            console.log(playersArray[i][1], playersArray[i+1][1]);
        }else{ // if odd numbered players
            if(i === playersArray.length - 1){ // and it is the last element
                console.log(playersArray[i][1], 0);
            }else{
                console.log(playersArray[i][1], playersArray[i+1][1]);
            }
        }
    }
}

KeizerPairing("../TRFx/sample-keizer-pairing--1.trf");

