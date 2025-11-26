export class OperacionesDistancia {
  x1!: number;
  y1!: number;
  x2!: number;
  y2!: number;
  resultado!: number;

  calcularDistancia(): void {
    let dist = Math.pow(this.x2 - this.x1, 2) + Math.pow(this.y2-this.y1, 2);
    let distanciaTot = Math.sqrt(dist);
    this.resultado = distanciaTot;
   
  }
}