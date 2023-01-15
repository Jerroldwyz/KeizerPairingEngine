import { promises as fsPromises } from "fs";
import { join } from 'path';

class Player {

    private _player_id: number;
    public get player_id(): number {
        return this._player_id;
    }
    public set player_id(value: number) {
        this._player_id = value;
    }
    private _last_name: string;
    public get last_name(): string {
        return this._last_name;
    }
    public set last_name(value: string) {
        this._last_name = value;
    }
    private _first_name: string;
    public get first_name(): string {
        return this._first_name;
    }
    public set first_name(value: string) {
        this._first_name = value;
    }
    private _player_keizer_val: number;
    public get player_keizer_val(): number {
        return this._player_keizer_val;
    }
    public set player_keizer_val(value: number) {
        this._player_keizer_val = value;
    }
    private _player_score: number = 0;
    public get player_score(): number {
        return this._player_score;
    }
    public set player_score(value: number) {
        this._player_score = value;
    }
    private _oponent_player_id: any = undefined;
    public get oponent_player_id(): any {
        return this._oponent_player_id;
    }
    public set oponent_player_id(value: any) {
        this._oponent_player_id = value;
    }
    private _round_result: any = undefined;
    public get round_result(): any {
        return this._round_result;
    }
    public set round_result(value: any) {
        this._round_result = value;
    }
    private _player_color: string;
    public get player_color(): string {
        return this._player_color;
    }
    public set player_color(value: string) {
        this._player_color = value;
    }

    constructor(id : number, last_name : string, first_name : string, player_keizer_val : number, player_color : string, player_score : number, oponent_player_id? : number, round_result? :number) {

        this._player_id = id;
        this._last_name = last_name;
        this._first_name = first_name;
        this._player_keizer_val = player_keizer_val;
        this._player_score = player_score;
        this._player_color = player_color;
        
        if (typeof oponent_player_id !== 'undefined') {
            this._oponent_player_id = oponent_player_id;
        }

        if (typeof round_result !== 'undefined') {
            this._round_result  = round_result;
        }
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

// function to calulate player's score

function calculating_scores(p1 : Player, p2 : Player) {

    if (p1.round_result == 1) {
        p1.player_score += p2.player_keizer_val
    }
    else if (p1.round_result == 2) {
        p2.player_score += p1.player_keizer_val
    }
    else {
        p1.player_score += p2.player_keizer_val/2
        p2.player_score += p1.player_keizer_val/2
    }

}

KeizerPairing([1,2,3,4,5,6,7,8,9], "../TRFx/sample-keizer-pairing--1.trf");




