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
                    sanitisedFile.push(TRFxFileSplit[line]);
                }
            }
            return sanitisedFile;
        }
        catch (err) {
            console.log(err);
            return 'Something went wrong';
        }
    });
}
function KeizerPairing(input, filename) {
    return __awaiter(this, void 0, void 0, function* () {
        let TRFx = yield asyncReadFile(filename);
        for (let i = 0; i < TRFx.length; i++) {
            console.log(TRFx[i]);
        }
        let result = [[]];
        console.log(Math.floor(input.length / 2));
        for (let i = 0; i < input.length; i += 2) {
            if (input.length % 2 === 0) {
                result.push([input[i], input[i + 1]]);
                console.log(input[i], input[i + 1]);
            }
            else {
                if (i === input.length - 1) {
                    result.push([input[i]]);
                    console.log(input[i]);
                }
                else {
                    result.push([input[i], input[i + 1]]);
                    console.log(input[i], input[i + 1]);
                }
            }
        }
    });
}
KeizerPairing([1, 2, 3, 4, 5, 6, 7, 8, 9], "../TRFx/sample-keizer-pairing--1.trf");
//# sourceMappingURL=KeizerPairing.js.map