import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { OperacionesZodiaco } from './zodiacoOperaciones';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';


@Component({
  selector: 'app-zodiaco',
  imports: [FormsModule, ReactiveFormsModule, RouterLink, NgIf],
  templateUrl: './zodiaco.component.html',
  styleUrl: './zodiaco.component.css'
})
export class ZodiacoComponent {
  formulario!:FormGroup;
  objZod=new OperacionesZodiaco();
  nombreCompleto!:string;
  edadvuelta!:number;
  sexovuelta!:string;
  sexoresultado!:string;
  signozodiacal!:string;
  indicezodiaco!:number;
  nombrezodiacovuelta!:string;
  
  

  ngOnInit(): void {
    this.formulario = new FormGroup({
      nombre: new FormControl(''),
      apaterno: new FormControl(''),
      amaterno: new FormControl(''),
      dia: new FormControl(''),
      mes: new FormControl(''),
      ano: new FormControl(''),
      sexo: new FormControl('')
    });
  }
   
  imprimir(): void {
    this.objZod.nombre= this.formulario.value.nombre;
    this.objZod.apaterno= this.formulario.value.apaterno;
    this.objZod.amaterno= this.formulario.value.amaterno;
    this.objZod.dia= this.formulario.value.dia;
    this.objZod.mes= this.formulario.value.mes;
    this.objZod.ano= this.formulario.value.ano;
    this.objZod.sexo= this.formulario.value.sexo;

    this.objZod.calcularZodiaco();
    this.nombreCompleto=this.objZod.nombreCompleto;
    this.edadvuelta=this.objZod.edad;
    this.sexoresultado=this.objZod.sexovuelta;
    this.signozodiacal=this.objZod.signozodiacal;
    this.indicezodiaco=this.objZod.indicezodiaco;    
    this.nombrezodiacovuelta=this.objZod.nombrezodiacovuelta;
      
  }
}
