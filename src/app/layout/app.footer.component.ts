import { Component } from '@angular/core';
import { LayoutService } from "../demo/components/service/app.layout.service";
import { ConfigService } from '../demo/service/config.service';

@Component({
    selector: 'app-footer',
    templateUrl: './app.footer.component.html'
})
export class AppFooterComponent {
    constructor(public layoutService: LayoutService, private configService: ConfigService) { }

    version: string

    ngOnInit(): void {
        this.version = this.configService.getVersion()
    }
}
