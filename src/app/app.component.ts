import { Component, OnInit } from '@angular/core';
import { PrimeNGConfig } from 'primeng/api';
import { MiembrosService } from './demo/service/miembros.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

    constructor(private primengConfig: PrimeNGConfig,private miembrosService: MiembrosService) { }

    ngOnInit() {
        this.primengConfig.ripple = true;
        this.miembrosService.initDefaultMiembro();
    }
}
