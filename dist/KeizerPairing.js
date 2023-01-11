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
function asyncReadFile(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const TRFxFile = yield fs_1.promises.readFile((0, path_1.join)(__dirname, filename), 'utf-8');
            const TRFxFileSplit = TRFxFile.split("\n");
            let sanitisedFile = [];
            for (let line = 0; line < TRFxFileSplit.length; line++) {
                if (TRFxFileSplit[line].substring(0, 3) === '001') {
                    sanitisedFile.push(TRFxFileSplit[line].replace(/\s+/g, ' ').split(' '));
                }
            }
            return sanitisedFile;
        }
        catch (err) {
            console.log(err);
            return [['']];
        }
    });
}
function KeizerPairing(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        let playersArray = yield asyncReadFile(filename);
        playersArray.push(['001', '11', 'm', 'g', 'Mirzoev,', 'Azer', '2527', 'AZE', '13400304', '1978', '4.0', '1', '26', 'w', '1', '13', 'b', '1', '8', 'w', '1', '4', 'b', '1']);
        let bottomKeizerValue = Math.floor(playersArray.length / 2);
        for (let i = playersArray.length - 1; i >= 0; i--) {
            playersArray[i].push(bottomKeizerValue.toString());
            bottomKeizerValue++;
        }
        for (let i = 0; i <= playersArray.length - 1; i++) {
            console.log(playersArray[i]);
        }
        console.log(Math.ceil(playersArray.length / 2));
        for (let i = 0; i < playersArray.length; i += 2) {
            if (playersArray.length % 2 === 0) {
                console.log(playersArray[i][1], playersArray[i + 1][1]);
            }
            else {
                if (i === playersArray.length - 1) {
                    console.log(playersArray[i][1], 0);
                }
                else {
                    console.log(playersArray[i][1], playersArray[i + 1][1]);
                }
            }
        }
    });
}
KeizerPairing("../TRFx/sample-keizer-pairing--1.trf");
//# sourceMappingURL=KeizerPairing.js.map