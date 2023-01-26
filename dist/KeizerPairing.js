"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = require("path");
class Player {
    constructor() {
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
function asyncReadFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const TRFxFile = yield fs_1.promises.readFile((0, path_1.join)(__dirname, filename), 'utf-8');
            const TRFxFileSplit = TRFxFile.split("\n");
            let numberOfRounds = 1;
            let playersArray = [];
            for (let row = 0; row < TRFxFileSplit.length; row++) {
                if (TRFxFileSplit[row].substring(0, 3) == 'XXR') {
                    numberOfRounds = +TRFxFileSplit[row][4];
                }
                if (TRFxFileSplit[row].substring(0, 3) === '001') {
                    let player = new Player();
                    player.startingRank = +TRFxFileSplit[row].substring(4, 8);
                    player.points = +TRFxFileSplit[row].substring(80, 84);
                    player.rank = +TRFxFileSplit[row].substring(85, 89);
                    let opponentIndex = 94;
                    let colorIndex = 96;
                    let resultIndex = 98;
                    for (let round = 0; round < numberOfRounds; round++) {
                        if (typeof TRFxFileSplit[row][opponentIndex] === "undefined") {
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
        }
        catch (err) {
            console.log(err);
            return [];
        }
    });
}
function KeizerPairing(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        let playersArray = yield asyncReadFile(filename);
        let bottomKeizerValue = Math.floor(playersArray.length / 2);
        for (let i = playersArray.length - 1; i >= 0; i--) {
            playersArray[i].keizerValue = bottomKeizerValue;
            bottomKeizerValue++;
        }
        for (let i = 0; i <= playersArray.length - 1; i++) {
            console.log(playersArray[i].opponentSeed);
            console.log(playersArray[i].colorAllocation);
            console.log(playersArray[i].roundResult);
            console.log(playersArray[i].keizerValue);
        }
        for (let index = 0; index < playersArray.length; index++) {
            let opponent = playersArray[playersArray[index].opponentSeed[0]];
            let player = playersArray[index];
            if (player.roundResult[0] === '1') {
                player.keizerScore = player.keizerValue + opponent.keizerValue;
            }
            else if (player.roundResult[0] === '=') {
                player.keizerScore = player.keizerValue + (opponent.keizerValue / 2);
            }
            else if (player.roundResult[0] === '0') {
                player.keizerScore = player.keizerValue + 0;
            }
            else if (player.roundResult[0] === 'U') {
                player.keizerScore = player.keizerScore * 2;
            }
            console.log(player.keizerScore);
        }
        console.log(Math.ceil(playersArray.length / 2));
        for (let i = 0; i < playersArray.length; i += 2) {
            if (playersArray.length % 2 === 0) {
                console.log(playersArray[i].startingRank, playersArray[i + 1].startingRank);
            }
            else {
                if (i === playersArray.length - 1) {
                    console.log(playersArray[i].startingRank, 0);
                }
                else {
                    console.log(playersArray[i].startingRank, playersArray[i + 1].startingRank);
                }
            }
        }
    });
}
KeizerPairing("../TRFx/sample-keizer-pairing--1.trf");
//# sourceMappingURL=KeizerPairing.js.map