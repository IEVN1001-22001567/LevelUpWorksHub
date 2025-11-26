import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OperacionesDistancia } from './distanciaoperaciones';
import { RouterLink } from '@angular/router';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-distancia',
  imports: [FormsModule, ReactiveFormsModule,RouterLink],
  templateUrl: './distancia.component.html',
  styleUrl: './distancia.component.css'
})
export class DistanciaComponent {
  formulario!:FormGroup;
  objDist=new OperacionesDistancia();
  resultado!:number;

   constructor() {}

  ngOnInit(): void {
    initFlowbite();
    this.formulario = new FormGroup({
      x1: new FormControl(''),
      y1: new FormControl(''),
      x2: new FormControl(''),
      y2: new FormControl('')
    });
  }
   
  Distancia(): void {
    this.objDist.x1= this.formulario.value.x1;
    this.objDist.x2= this.formulario.value.x2;
    this.objDist.y1= this.formulario.value.y1;
    this.objDist.y2= this.formulario.value.y2;

  this.objDist.calcularDistancia();
  this.resultado= this.objDist.resultado;
      
  }
}
