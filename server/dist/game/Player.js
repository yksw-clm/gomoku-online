"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(name, color) {
        this.name = name;
        this.color = color;
    }
    getName() {
        return this.name;
    }
    getColor() {
        return this.color;
    }
}
exports.Player = Player;
