import { promises as fsPromises } from "fs";
import { join } from 'path';

async function asyncReadFile(filename: string) {
    try {
        const TRFxFile = 
        await fsPromises.readFile(join(__dirname, filename),'utf-8');

        const TRFxFileSplit = TRFxFile.split("\n")
        let sanitisedFile: string[] = []
        for(let line = 0; line < TRFxFileSplit.length; line++){
            if(TRFxFileSplit[line].substring(0,3) === '001'){
                sanitisedFile.push(TRFxFileSplit[line])
            }
        }

        return sanitisedFile;

    } catch (err) {
        console.log(err);
        return 'Something went wrong';
    }
}
async function KeizerPairing(input: number[], filename: string): Promise<void> {
    let TRFx = await asyncReadFile(filename);
    for(let i = 0; i < TRFx.length; i++){
        console.log(TRFx[i])
    }

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