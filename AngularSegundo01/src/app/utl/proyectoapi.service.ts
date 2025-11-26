import { HttpClient} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlumnosUtl } from './alumnos';
import { Observable } from 'rxjs';
 
 
 
@Injectable({
  providedIn: 'root'
})
export class ProyectoapiService {
 
  constructor(private  http: HttpClient) { }
 
 
public getAlumnos():Observable<AlumnosUtl[]>{
  return this.http.get<AlumnosUtl[]>('http://127.0.0.1:5000/alumnos')
}
 
agregarNuevoAlumno(datos:AlumnosUtl){
  return this.http.post('http://127.0.0.1:5000/alumnos',datos)
}
 
public getAlumno(mat:number):Observable<AlumnosUtl>{
  console.log(mat)
  return this.http.get<AlumnosUtl>('http://127.0.0.1:5000/alumnos/'+mat)
}
 
modificarAlumno(mat:number,datos:AlumnosUtl){
  return this.http.put('http://127.0.0.1:5000/alumnos/'+mat,datos)
}
public EliminaAlumno(mat:number):Observable<AlumnosUtl>{
  return this.http.delete<AlumnosUtl>('http://127.0.0.1:5000/alumnos/'+mat)
}
 
}
 
