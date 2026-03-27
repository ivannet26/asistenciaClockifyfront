import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
@Component({
  selector: 'app-mensajemodal',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './mensajemodal.component.html',
  styleUrl: './mensajemodal.component.css'
})
export class MensajemodalComponent implements OnInit{
  ngOnInit(): void {
    
  }

}
