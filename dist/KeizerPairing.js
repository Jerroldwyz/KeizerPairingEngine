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
var matchOutcome;
(function (matchOutcome) {
    matchOutcome["win"] = "1";
    matchOutcome["lose"] = "0";
    matchOutcome["draw"] = "=";
    matchOutcome["pairingAllocatedBye"] = "U";
})(matchOutcome || (matchOutcome = {}));
var totalNumberOfRounds = 1;
var currentNumOfRounds = 0;
function asyncReadFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const TRFxFile = yield fs_1.promises.readFile((0, path_1.join)(__dirname, filename), 'utf-8');
            const TRFxFileSplit = TRFxFile.split("\n");
            let playersArray = [];
            DataExtraction(TRFxFileSplit, playersArray);
            return playersArray;
        }
        catch (err) {
            console.log(err);
            return [];
        }
    });
}
function DataExtraction(TRFxFileSplit, playersArray) {
    for (let row = 0; row < TRFxFileSplit.length; row++) {
        RoundsExtraction(TRFxFileSplit, row);
        PlayerDataExtraction(TRFxFileSplit, row, playersArray);
    }
}
function RoundsExtraction(TRFxFileSplit, row) {
    if (TRFxFileSplit[row].substring(0, 3) == 'XXR') {
        totalNumberOfRounds = +TRFxFileSplit[row][4];
    }
}
function PlayerDataExtraction(TRFxFileSplit, row, playersArray) {
    if (TRFxFileSplit[row].substring(0, 3) === '001') {
        let player = new Player();
        player.startingRank = +TRFxFileSplit[row].substring(4, 8);
        player.points = +TRFxFileSplit[row].substring(80, 84);
        player.rank = +TRFxFileSplit[row].substring(85, 89);
        MatchDataExtraction(TRFxFileSplit, row, player);
        playersArray.push(player);
    }
}
function MatchDataExtraction(TRFxFileSplit, row, player) {
    let opponentIndex = 91;
    let colorIndex = 96;
    let resultIndex = 98;
    for (let round = 0; round < totalNumberOfRounds; round++) {
        if (typeof TRFxFileSplit[row][opponentIndex] === 'undefined') {
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
function KeizerPairing(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        let playersArray = yield asyncReadFile(filename);
        console.log(currentNumOfRounds);
        for (let round = 1; round <= currentNumOfRounds; round++) {
            AssignKeizerValue(playersArray);
            SortByStartingRank(playersArray);
            CalculateKeizerScore(playersArray, round);
            SortByKeizerScore(playersArray);
        }
        PlayerPairing(playersArray);
    });
}
function AssignKeizerValue(playersArray) {
    let bottomKeizerValue = Math.floor(playersArray.length / 2);
    for (let i = playersArray.length - 1; i >= 0; i--) {
        playersArray[i].keizerValue = bottomKeizerValue;
        bottomKeizerValue++;
    }
}
function SortByStartingRank(playersArray) {
    playersArray.sort((player1, player2) => (player1.startingRank > player2.startingRank) ? 1 : (player1.startingRank < player2.startingRank) ? -1 : 0);
}
function CalculateKeizerScore(playersArray, round) {
    for (let index = 0; index < playersArray.length; index++) {
        let player = playersArray[index];
        player.keizerScore = player.keizerValue;
        for (let i = 0; i < round; i++) {
            let opponent = playersArray[player.opponentSeed[i] - 1];
            switch (player.roundResult[i]) {
                case matchOutcome.win:
                    player.keizerScore += opponent.keizerValue;
                    break;
                case matchOutcome.lose:
                    player.keizerScore += 0;
                    break;
                case matchOutcome.draw:
                    player.keizerScore += (opponent.keizerValue / 2);
                    break;
                case matchOutcome.pairingAllocatedBye:
                    player.keizerScore = player.keizerScore * 2;
                    break;
            }
        }
        console.log(player.keizerScore);
    }
}
function SortByKeizerScore(playersArray) {
    playersArray.sort((player1, player2) => (player1.keizerScore < player2.keizerScore) ? 1 : (player1.keizerScore > player2.keizerScore) ? -1 : 0);
}
function PlayerPairing(playersArray) {
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
}
KeizerPairing("../TRFx/sample-keizer-pairing--1.trf");
//# sourceMappingURL=KeizerPairing.js.map