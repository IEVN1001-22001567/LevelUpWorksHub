import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Multiplica } from './multiplica';
import { initFlowbite } from 'flowbite';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-apor-b',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './apor-b.component.html',
  styleUrl: './apor-b.component.css'
})
export class AporBComponent {
  title = 'web-app';
 formulario!:FormGroup;
    resultado!:number;
    resultadotexto!:string;
    objMult=new Multiplica();
    texto!:string;
    
    ngOnInit():void{
      initFlowbite();
      this.formulario=new FormGroup({
        numero1: new FormControl(''),
        numero2: new FormControl(''),
        texto: new FormControl('')
       });
    }

    multNumeros():void{
    this.objMult.numero1= this.formulario.value.numero1;
    this.objMult.numero2= this.formulario.value.numero2;
    this.objMult.texto= this.formulario.value.texto;
    this.objMult.multNumeros();
    this.resultado=this.objMult.resultado;
    this.resultadotexto=this.objMult.resultadotexto;
    }
}
