export class Multiplica{
  numero1!: number;
  numero2!: number;
  resultado!: number;
  resultadotexto!: string;
  texto!:string;

  multNumeros(): void {
    let textosuma='';
    let op=0;
    for (let i=0; i < this.numero1; i++) {
    op+=this.numero2;
    if (i > 0){
    textosuma += '+';
    }
    textosuma += this.numero2;
    }
    this.resultadotexto = textosuma + '=' + op;
  }

}

