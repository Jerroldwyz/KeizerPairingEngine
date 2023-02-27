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
        this.paired = false;
    }
}
var matchOutcome;
(function (matchOutcome) {
    matchOutcome["win"] = "1";
    matchOutcome["lose"] = "0";
    matchOutcome["draw"] = "=";
    matchOutcome["pairingAllocatedBye"] = "U";
})(matchOutcome || (matchOutcome = {}));
var color;
(function (color) {
    color["black"] = "b";
    color["white"] = "w";
})(color || (color = {}));
const discardRules = {
    rule2: 0,
    rule3: 0,
    rule4: 0
};
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
        console.log("Current number of rounds: " + currentNumOfRounds);
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
    }
}
function SortByKeizerScore(playersArray) {
    playersArray.sort((player1, player2) => (player1.keizerScore < player2.keizerScore) ? 1 : (player1.keizerScore > player2.keizerScore) ? -1 : 0);
}
function PlayerPairing(playersArray) {
    let matchupArray = [];
    console.log(Math.ceil(playersArray.length / 2));
    if (playersArray.length % 2 === 0) {
        for (let i = 0; i < playersArray.length; i++) {
            if (!playersArray[i].paired) {
                if (tryMatchUp(playersArray[i], playersArray[i + 1])) {
                    matchupArray.push([playersArray[i], playersArray[i + 1]]);
                }
                else {
                    if (!tryNext(playersArray, matchupArray, i)) {
                        if (!rePair(playersArray, matchupArray, i)) {
                            discardRules.rule4 = 1;
                        }
                    }
                    if (!tryNext(playersArray, matchupArray, i)) {
                        if (!rePair(playersArray, matchupArray, i)) {
                            discardRules.rule3 = 1;
                        }
                    }
                    if (!tryNext(playersArray, matchupArray, i)) {
                        if (!rePair(playersArray, matchupArray, i)) {
                            discardRules.rule2 = 1;
                        }
                    }
                    tryNext(playersArray, matchupArray, i);
                }
            }
        }
    }
    else if (playersArray.length % 2 === 1) {
        let bye = new Player();
        for (let i = 0; i < playersArray.length; i++) {
            if (i === playersArray.length - 1) {
                if (!sameBye) {
                    matchupArray.push([playersArray[i], bye]);
                }
                else {
                    let breakPair = breakNextPair(matchupArray);
                    if (tryMatchUp(breakPair[1], playersArray[i])) {
                        matchupArray.push([breakPair[1], playersArray[i]]);
                        matchupArray.push([breakPair[0], bye]);
                    }
                    else if (tryMatchUp(breakPair[0], playersArray[i])) {
                        matchupArray.push([breakPair[0], playersArray[i]]);
                        matchupArray.push([breakPair[1], bye]);
                    }
                }
            }
            else {
                if (tryMatchUp(playersArray[i], playersArray[i + 1])) {
                    matchupArray.push([playersArray[i], playersArray[i + 1]]);
                }
                else {
                    if (!tryNext(playersArray, matchupArray, i)) {
                        if (!rePair(playersArray, matchupArray, i)) {
                            discardRules.rule4 = 1;
                        }
                    }
                    if (!tryNext(playersArray, matchupArray, i)) {
                        if (!rePair(playersArray, matchupArray, i)) {
                            discardRules.rule3 = 1;
                        }
                    }
                    if (!tryNext(playersArray, matchupArray, i)) {
                        if (!rePair(playersArray, matchupArray, i)) {
                            discardRules.rule2 = 1;
                        }
                    }
                    tryNext(playersArray, matchupArray, i);
                }
            }
        }
    }
    for (let i = 0; i < matchupArray.length; i++) {
        console.log(matchupArray[i][0].startingRank + " " + matchupArray[i][1].startingRank);
    }
}
function sameBye(player) {
    if (player.roundResult[-1] === "U" && player.roundResult[-2] === "U") {
        return true;
    }
    return false;
}
function tryMatchUp(player1, player2) {
    if (!player2.paired) {
        if (discardRules.rule2 || !sameOpponent(player1, player2)) {
            if (discardRules.rule3 || !sameColourHistory(player1, player2)) {
                if (discardRules.rule4 || !sameColourScore(player1, player2)) {
                    player1.paired = true;
                    player2.paired = true;
                    return true;
                }
            }
        }
    }
    return false;
}
function sameOpponent(player1, player2) {
    let playerOpponentList = player1.opponentSeed;
    let length = playerOpponentList.length;
    if (playerOpponentList[length - 1] === playerOpponentList[length - 2]) {
        if (playerOpponentList[length - 1] === player2.startingRank) {
            console.log(player2.startingRank);
            return true;
        }
    }
    return false;
}
function sameColourHistory(player1, player2) {
    let p1ColorList = player1.colorAllocation;
    let p2ColorList = player2.colorAllocation;
    let p1Listlength = p1ColorList.length;
    let p2Listlength = p2ColorList.length;
    if (p1ColorList[p1Listlength - 1] === p1ColorList[p1Listlength - 2]) {
        if (p2ColorList[p2Listlength - 1] === p1ColorList[p1Listlength - 1] &&
            p2ColorList[p2Listlength - 2] === p1ColorList[p1Listlength - 2]) {
            return true;
        }
    }
    return false;
}
function sameColourScore(player1, player2) {
    let p1ColorScore = 0;
    let p2ColorScore = 0;
    for (let i = 0; i < player1.colorAllocation.length; i++) {
        switch (player1.colorAllocation[i]) {
            case color.black:
                p1ColorScore--;
                break;
            case color.white:
                p1ColorScore++;
                break;
        }
    }
    for (let i = 0; i < player2.colorAllocation.length; i++) {
        switch (player2.colorAllocation[i]) {
            case color.black:
                p2ColorScore--;
                break;
            case color.white:
                p2ColorScore++;
                break;
        }
    }
    if (p1ColorScore === p2ColorScore) {
        if (p1ColorScore >= 2 || p1ColorScore <= -2) {
            return true;
        }
    }
    return false;
}
function tryNext(playersArray, matchupArray, i) {
    let nextTry = i + 2;
    for (nextTry; nextTry < playersArray.length; nextTry++) {
        if (tryMatchUp(playersArray[i], playersArray[nextTry])) {
            matchupArray.push([playersArray[i], playersArray[nextTry]]);
            playersArray[i].paired = true;
            playersArray[nextTry].paired = true;
            return true;
        }
    }
    return false;
}
function recursionPairing(playersArray, matchupArray, end) {
    let brokenPair = breakNextPair(matchupArray);
    if (brokenPair === undefined) {
        return false;
    }
    let i = playersArray.indexOf(brokenPair[1]) + 1;
    while (matchupArray.length != Math.ceil(end / 2)) {
        for (i; i <= end; i++) {
            for (let j = 0; j < brokenPair.length; j++) {
                if (tryMatchUp(brokenPair[j], playersArray[i])) {
                    matchupArray.push([brokenPair[j], playersArray[i]]);
                }
            }
        }
        let remainingPlayers = [];
        for (let k = 0; k < end; k++) {
            if (!playersArray[k].paired) {
                remainingPlayers.push(playersArray[k]);
            }
        }
        if (remainingPlayers.length % 2 === 0) {
            for (let x = 0; x < remainingPlayers.length; x + 2) {
                if (tryMatchUp(remainingPlayers[x], remainingPlayers[x + 1])) {
                    matchupArray.push([remainingPlayers[x], remainingPlayers[x + 1]]);
                }
                else {
                    recursionPairing(playersArray, matchupArray, end);
                }
            }
        }
    }
    return true;
}
function breakNextPair(matchupArray) {
    let brokenPair = matchupArray[matchupArray.length - 1];
    brokenPair[0].paired = false;
    brokenPair[1].paired = false;
    matchupArray.pop();
    return brokenPair;
}
function rePair(playersArray, matchupArray, i) {
    let end = i + 1;
    if (matchupArray.length === 0) {
        return false;
    }
    let brokenPair = breakNextPair(matchupArray);
    matchupArray.pop();
    if (tryMatchUp(brokenPair[0], playersArray[i]) && tryMatchUp(brokenPair[1], playersArray[i + 1])) {
        matchupArray.push([brokenPair[0], playersArray[i]]);
        matchupArray.push([brokenPair[1], playersArray[i + 1]]);
    }
    else if (tryMatchUp(brokenPair[0], playersArray[i + 1]) && tryMatchUp(brokenPair[1], playersArray[i])) {
        matchupArray.push([brokenPair[0], playersArray[i]]);
        matchupArray.push([brokenPair[1], playersArray[i + 1]]);
    }
    else {
        if (recursionPairing(playersArray, matchupArray, end)) {
            return true;
        }
    }
    return false;
}
KeizerPairing("../TRFx/david-keizer-pairing.trf");
//# sourceMappingURL=KeizerPairing.js.map