export class Player {
  name: string;
  color: "black" | "white";

  constructor(name: string, color: "black" | "white") {
    this.name = name;
    this.color = color;
  }

  getName(): string {
    return this.name;
  }

  getColor(): "black" | "white" {
    return this.color;
  }
}
