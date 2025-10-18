import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { MockApiService } from '../shared/mock-api.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@Component({
    selector: 'app-shell',
    standalone: true,
    imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf, MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule, MatButtonModule],
    styles: [`.h-screen{height:100vh}.w-64{width:16rem}.active{font-weight:600}`],
    templateUrl: './shell.component.html',
    styleUrls: ['./shell.component.css']
})
export class AppShellComponent {
    api = inject(MockApiService);
}