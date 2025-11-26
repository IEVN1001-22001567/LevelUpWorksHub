import { ZodiacoComponent } from './zodiaco.component';
export class OperacionesZodiaco {
    nombre!: string;
    apaterno!: string;
    amaterno!: string;
    dia!: number;
    mes!: number;
    ano!: number;
    sexo!: string;
    edad!: number;
    nombreCompleto!: string;
    edadvuelta!: number;
    sexovuelta!: string;
    signozodiacal!: string;
    indicezodiaco!: number;
    nombrezodiacovuelta!: string;

    calcularZodiaco(): void {
        let signos = [];
        let indice = 0;
        
        let fechahoy= new Date();
        this.nombreCompleto = this.nombre + " " + this.apaterno + " " + this.amaterno;

        if (this.sexo == "Masculino") {
            this.sexovuelta = "Masculino";
        } else if (this.sexo == "Femenino") {
            this.sexovuelta = "Femenino";
        } else{
            this.sexovuelta = "No selecciono nada";
        }


         this.edad = 2025 - this.ano;
        if(this.mes > fechahoy.getMonth()+1){
            this.edad--;
        }

        this.edadvuelta = this.edad;

        signos= ["Rata", "Buey", "Tigre", "Conejo", "Dragón", "Serpiente", "Caballo", "Cabra", "Mono", "Gallo", "Perro", "Cerdo"];
        indice=(this.ano-4)%12;
        this.signozodiacal = signos[indice];

        this.indicezodiaco = indice+1;

        let nombrezodiaco:{[key:string]:string } = {
        "Rata": "rata-zodiaco.jpg.webp",
        "Buey": "BUEY.jpg.webp",
        "Tigre": "tigre-zodiaco.jpg.webp",
        "Conejo": "conejo.jpg.webp",
        "Dragón": "dragon.jpg.webp",
        "Serpiente": "serpiente.jpg.webp",
        "Caballo": "caballo.jpg.webp",
        "Cabra": "cabra.jpg.webp",
        "Mono": "mono.jpg.webp",
        "Gallo": "gallo.jpg.webp",
        "Perro": "perro.jpg.webp",
        "Cerdo": "cerdo.jpg.webp"
        }; 
        this.nombrezodiacovuelta = nombrezodiaco[this.signozodiacal];        
    }
    
}

