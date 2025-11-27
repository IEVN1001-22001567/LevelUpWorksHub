import { Component } from '@angular/core';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [NgFor],
  templateUrl: './inicio.component.html',
})
export default class InicioComponent {

  equipo = [
    {
      nombre: 'Alex Eduardo García',
      rol: 'Frontend Developer',
      foto: 'assets/img/equipo/alex.png'
    },
    {
      nombre: 'Christian Barrón',
      rol: 'Backend Developer',
      foto: 'assets/img/equipo/chris.png'
    },
    {
      nombre: 'Miguel Frausto',
      rol: 'UI/UX Designer',
      foto: 'assets/img/equipo/miguel.png'
    },
    {
      nombre: 'Marin Kitagawa',
      rol: 'Tester / QA',
      foto: 'assets/img/equipo/marin.png'
    }
  ];

}
