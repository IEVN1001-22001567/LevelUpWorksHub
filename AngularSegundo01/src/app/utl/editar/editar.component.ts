import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AlumnosUtl } from '../alumnos';
import { CommonModule, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProyectoapiService } from '../proyectoapi.service';
 
@Component({
  selector: 'app-editar',
  standalone: true,
  imports: [FormsModule,ReactiveFormsModule,CommonModule,RouterLink],
  templateUrl: './editar.component.html',
  styles: ``
})
export default class EditarComponent {
  dataSource:any=[];
  formGroup!: FormGroup;
  tem:any;
  regAlumno:AlumnosUtl={
    matricula:0,
    nombre:'',
    apaterno:'',
    amaterno:'',
    correo:''
  }
  constructor(private fb: FormBuilder,private location: Location,public alumnosUtl: ProyectoapiService, private router:Router){}
 
 
  ngOnInit(){
    this.formGroup=this.initForm();
    this.tem = this.location.path().split('/')
    console.log("componente "+this.tem[3])
    this.alumnosUtl.getAlumno(parseInt(this.tem[3])).subscribe(
      {
        next: response=>{
 
      this.dataSource=response;
          console.log(this.dataSource)
          this.asignaCampos(this.dataSource)
 
    },
    error: error=>console.log(error)
  }
    );
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
 
  asignaCampos(dataSource:any){
    this.regAlumno.matricula=dataSource.alumno.matricula
    this.regAlumno.nombre=dataSource.alumno.nombre
    this.regAlumno.apaterno=dataSource.alumno.apaterno
    this.regAlumno.amaterno=dataSource.alumno.amaterno
    this.regAlumno.correo=dataSource.alumno.correo
    console.log(dataSource.alumno.matricula)
 }
 
 modificar(){
  this.alumnosUtl.modificarAlumno(this.tem[3],this.regAlumno).subscribe({
    next:()=>console.log(),
    error:(e)=> console.error(e),
    complete:()=>console.info()})
 
    this.router.navigate(['/utl/listaalumnos'])
 
}
 
}
 