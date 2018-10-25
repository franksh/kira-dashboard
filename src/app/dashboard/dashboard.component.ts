import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { Breakpoints, BreakpointState, BreakpointObserver, LayoutModule } from '@angular/cdk/layout';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  /** Based on the screen size, switch from standard to one column per row */
  
  isSmallScreen = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    
    breakpointObserver.observe('(max-width: 1528px)').subscribe((result) => {
      console.log(result);
      var accordion = document.getElementById("side-accordion");
      var map = document.getElementById("map-div");
      if (result.matches) {
        accordion.style.width = "100%";
        accordion.style.minWidth = "800px"
        map.style.width = "100%"; 
      }
      else {
        accordion.style.width = "calc(30% + 200px)";
        accordion.style.minWidth = "400px"
        map.style.width = "calc(70% - 240px)"; 
      }
  })
  }
}
