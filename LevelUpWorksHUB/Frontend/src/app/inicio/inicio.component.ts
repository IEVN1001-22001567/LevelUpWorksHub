import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './inicio.component.html',
})
export default class InicioComponent {

  equipo = [
    {
      nombre: 'Alex Eduardo García',
      rol: 'Backend Developer',
      foto: 'assets/img/alex.png'
    },
    {
      nombre: 'Christian Barrón',
      rol: 'Frontend Developer',
      foto: 'assets/img/chris.jpg'
    },
    {
      nombre: 'Miguel Frausto',
      rol: 'UI/UX Designer',
      foto: 'assets/img/miguel.png'
    },
    {
      nombre: 'Yafte Ramirez',
      rol: 'Tester / QA',
      foto: 'assets/img/yafte.png'
    }
  ];

}
