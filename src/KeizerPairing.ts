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

        const TRFxFileSplit = TRFxFile.split("\n") // splits the file by new lines
        let sanitisedFile: string[] = [] // sanitisedFile is an array that contains lines that stores players data
        for(let line = 0; line < TRFxFileSplit.length; line++){
            if(TRFxFileSplit[line].substring(0,3) === '001'){ // 001 is code for player data
                sanitisedFile.push(TRFxFileSplit[line]) 
            }
        }

        return sanitisedFile;

    } catch (err) { // catches the error if file read goes wrong
        console.log(err);
        return 'Something went wrong';
    }
}
/**
 * This function is incomplete, but it should encompass the algorithm for the Keizer pairing system.
 * @param input - this parameter to be deprecated later on
 * @param filename - The name of the file. Format: './filename.extension', '../folder/filename.extension'
 * @returns Returns void but should write pairings into an external text file.
 */
async function KeizerPairing(input: number[], filename: string): Promise<void> {
    let TRFx = await asyncReadFile(filename); // calls the asyncReadFile function to receive sanitised file
    for(let i = 0; i < TRFx.length; i++){
        console.log(TRFx[i]);
    }

    // MVP#1
    let result: [number[]] = [[]];
    console.log(Math.floor(input.length/2));
    for(let i = 0; i < input.length; i += 2){
        if(input.length%2 === 0){
            result.push([input[i], input[i+1]]);
            console.log(input[i], input[i+1]);
        }else{
            if(i === input.length - 1){
                result.push([input[i]]);
                console.log(input[i]);
            }else{
                result.push([input[i], input[i+1]]);
                console.log(input[i], input[i+1]);
            }
        }
    } 
}


KeizerPairing([1,2,3,4,5,6,7,8,9], "../TRFx/sample-keizer-pairing--1.trf");

//test test
//test