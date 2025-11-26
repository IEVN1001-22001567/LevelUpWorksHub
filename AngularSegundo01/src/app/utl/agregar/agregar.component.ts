import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AlumnosUtl } from '../alumnos';
 
import { Router, RouterLink } from '@angular/router';
import { ProyectoapiService } from '../proyectoapi.service';
@Component({
  selector: 'app-agregar',
  standalone: true,
  imports: [ReactiveFormsModule,RouterLink],
  templateUrl: './agregar.component.html',
 
})
export default class AgregarComponent implements OnInit{
  formGroup!: FormGroup;
 
  regAlumno:AlumnosUtl={
    matricula:0,
      nombre: '',
      apaterno: '',
      amaterno: '',
      correo:''
  }
  constructor(private fb: FormBuilder,public alumnosutl:ProyectoapiService, private router:Router) { }
 
  ngOnInit(): void {
    this.formGroup=this.initForm();
  }
 
  initForm():FormGroup{
    return this.fb.group({
      matricula: [''],
      nombre: [''],
      apaterno: [''],
      amaterno: [''],
      correo:['']
  })
 
    }
 
    agregar(){
      this.alumnosutl.agregarNuevoAlumno(this.regAlumno).subscribe({
        next:()=>console.log(),
 
        complete:()=>console.info()})
 
        this.regAlumno={
          matricula:0,
          nombre:'',
          apaterno:'',
          amaterno:'',
          correo:''
        }
 
        this.router.navigate(['/utl/listaalumnos'])
 
    }
 
    onSubmit():void{
      const {matricula,nombre,apaterno,amaterno,correo}= this.formGroup.value;
 
      this.regAlumno.matricula=matricula,
      this.regAlumno.nombre=nombre,
      this.regAlumno.apaterno=apaterno,
      this.regAlumno.amaterno=amaterno,
      this.regAlumno.correo=correo
      this.agregar()
 
    }
 
 
}