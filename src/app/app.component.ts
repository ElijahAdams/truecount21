/* tslint:disable:no-trailing-whitespace prefer-const max-line-length */
import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {DealingService} from './dealing.service';
import {fromEvent, Observable, Subscription} from 'rxjs';
import {animate, style, transition, trigger} from '@angular/animations';
import {debounceTime} from 'rxjs/operators';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('showingSmallMenu', [
      transition(':enter', [
        style({ transform: 'translateY(-100%)'}),
        animate('400ms ease-in', style({transform: 'translateY(0)'}))
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({transform: 'translateY(-100%)'}))
      ])
    ]),
  ]
})
export class AppComponent implements OnInit, AfterViewInit {
  pages = [
    {name: 'Home', url: 'home'},
    {name: 'Rules', url: 'rules'},
    {name: 'Counting', url: 'counting'},
    {name: 'Contact', url: 'contact'}
    ];
  isSmallScreen = false;
  isSmallMenuOpen = false;
  isMobile = false;
  resizeObs: Observable<Event>;
  resizeeSub: Subscription;
  constructor(private router: Router) {
  }
  ngOnInit() {
    this.resizeObs = fromEvent(window, 'resize');

    this.isSmallScreen = window.innerWidth <= 1005 ? true : false;
    this.resizeeSub = this.resizeObs.pipe(debounceTime(50)).subscribe( evt => {
      this.isSmallScreen = window.innerWidth <= 1005 ? true : false;
      this.isSmallMenuOpen = false;
    });
    console.log(this.isMobile + ':' + this.isSmallScreen);
  }
  ngAfterViewInit() {
  }

  toggleSmallMenu() {
    this.isSmallMenuOpen = !this.isSmallMenuOpen;
  }

  goToPage(page) {
    this.isSmallMenuOpen = false;
    this.router.navigateByUrl('/' + page.url);
  }
}
