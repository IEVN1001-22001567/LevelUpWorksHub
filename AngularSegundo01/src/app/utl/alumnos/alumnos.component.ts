import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProyectoapiService } from '../proyectoapi.service';
 
import { AlumnoFilterPipe } from '../alumnos-filter.pipe';
import { CommonModule } from '@angular/common';
import { AlumnosUtl } from '../alumnos';
 
@Component({
  selector: 'app-alumnos',
  imports: [FormsModule, RouterLink,AlumnoFilterPipe, CommonModule  ],
  templateUrl: './alumnos.component.html',
 
})
export default class AlumnosComponent{
 
 
  imageWidth:number=50;
  imageMargin:number=2;
  muestraImg:boolean=true;
  listFilter:string=''
  alumnoTitle!:string
  dataSource:any=[];
 
  constructor(public alumnosUtl:ProyectoapiService){}
 
  alumnosIric:AlumnosUtl[]=[
    {
      matricula:1234,
      nombre:'pedro',
      apaterno:'lopez',
      amaterno:'muñoz',
      correo: 'pedro@gmail.com',
 
    },
    {
      matricula:772,
      nombre:'Paulina',
      apaterno:'lopez',
      amaterno:'muñoz',
      correo: 'paulina@gmail.com',
    },
 
    {
      matricula:22,
      nombre:'Dario',
      apaterno:'lopez',
      amaterno:'muñoz',
      correo: 'dario@gmail.com',
 
    },
  ]
 
  ngOnInit(): void {
     this.alumnosUtl.getAlumnos().subscribe(
      {
        next: response=>{
 
      this.dataSource=response;
 
    },
    error: error=>console.log(error)
  }
    );
 
}
 
}
 
 