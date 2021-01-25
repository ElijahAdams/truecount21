/* tslint:disable:no-trailing-whitespace prefer-const */
import {
  Component,
  Input,
  OnInit,
  AfterViewChecked,
  Output,
  ChangeDetectorRef,
  EventEmitter,
  ViewChild,
  ElementRef, AfterViewInit, HostListener
} from '@angular/core';
import {DealingService} from '../dealing.service';
import {animate, keyframes, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-playing-hand',
  templateUrl: './playing-hand.component.html',
  styleUrls: ['./playing-hand.component.scss'],
  animations: [
    trigger('cardDealing', [
      transition(':enter', [
        style({transform: 'translate({{x}}px , {{y}}px) rotate(0)', opacity: '0'}),
        animate('600ms ease-in', style({transform: 'translate(0%, 0%) rotate({{degrees}}deg)', opacity: '1'}))
      ], {params: {x: 1, y: 1, rx: 1, ry: 1, degrees: 0}}),
      transition(':leave', [
        animate('500ms ease-in', style({transform: 'translate(-{{rx}}px, -{{ry}}px )'}))
      ], {params: {x: 1, y: 1, rx: 1, ry: 1}})
    ]),
    trigger('wiggleWin', [
      transition(':enter', [
        style({transform: 'scale(3)'}),
        animate(
          '3000ms',
          keyframes([
            style({transform: 'scale(1)'}),
            style({transform: 'scale(3)'}),
            style({transform: 'scale(1)'}),
            style({transform: 'scale(3)'}),
            style({transform: 'scale(1)'}),
            style({transform: 'scale(3)'}),
            style({transform: 'scale(1)'})
          ]))
      ])
    ]),
    trigger('lickadyLose', [
      transition(':enter', [
        style({transform: 'scale(3) rotate(0deg)'}),
        animate(
          '3000ms',
          keyframes([
            style({transform: 'scale(2.75) rotate(90deg)'}),
            style({transform: 'scale(2.5) rotate(180deg)'}),
            style({transform: 'scale(2.25) rotate(270deg)'}),
            style({transform: 'scale(2) rotate(360deg)'}),
            style({transform: 'scale(1.75) rotate(450deg)'}),
            style({transform: 'scale(1.5) rotate(540deg)'}),
            style({transform: 'scale(1.25) rotate(630deg)'}),
            style({transform: 'scale(1) rotate(720deg)'})
          ]))
      ])
    ]),
    trigger('pushadyPush', [
      transition(':enter', [
        style({transform: 'scale(3) translateX(0px)' }),
        animate(
          '3000ms',
          keyframes([
            style({transform: 'scale(2.75) translateX(5px)'}),
            style({transform: 'scale(2.5) translateX(-5px)'}),
            style({transform: 'scale(2.25) translateX(5px)'}),
            style({transform: 'scale(2) translateX(-5px)'}),
            style({transform: 'scale(1.75) translateX(5px)'}),
            style({transform: 'scale(1.5) translateX(-5px)'}),
            style({transform: 'scale(1.25) translateX(5px)'}),
            style({transform: 'scale(1) translateX(0px)'})
          ]))
      ])
    ])
  ]
})
export class PlayingHandComponent implements OnInit, AfterViewChecked, AfterViewInit {
  @Input() player;
  @Input() winnersUpdated;
  @Input() isCheckedCountHints;
  @Output() nextPlayerTurn = new EventEmitter();
  @Output() hit = new EventEmitter();
  @Output() doubleDown = new EventEmitter();
  @Output() split = new EventEmitter();
  @ViewChild('cardContainer', {static: false}) cardContainer: ElementRef;
  isBust = false;
  handTotal;
  shouldStackCards = false;
  stackOffset = 60;
  stackCenterPx = 0;
  centerCards: 0;
  showDealer = false;
  playerX =  0;
  playerY = 0;
  xMovement = 0;
  yMovement = 0;
  constructor(private dealingService: DealingService,
              private cdr: ChangeDetectorRef,
              private totalBody: ElementRef) { }
  ngOnInit() {
    this.dealingService.dealerHandReady.subscribe(dealerCoords => {
      // @ts-ignore
      this.yMovement += dealerCoords.y;
      this.checkDealer(); // this is a hack;
    });
    this.dealingService.sweep.subscribe(value => {
      this.removeCards();
    });
    this.stackOffset = window.innerWidth <= 1005 ? 40 : 60;
  }
  ngAfterViewInit() {
    // center of self
    const clientRect = this.cardContainer.nativeElement.getBoundingClientRect();
    this.playerX = clientRect.x + (clientRect.width);
    this.playerY = clientRect.y + (clientRect.height / 2);
    // I don't like the X movement so commenting it out.
    // this.xMovement = (screen.width / 2) - this.playerX;
    this.yMovement -= this.playerY;
    this.checkDealer();
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  determineTotal() {
    this.isBust = false;
    let totalDisplay = '';
    this.handTotal = this.player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
    if ( this.handTotal === 21 && this.player.hand.length === 2) {
      totalDisplay = 'BlackJack';
    } else if (this.player.hand.length === 2
      && this.player.hand[0].card === 'A'
      && this.player.hand[1].card === 'A') {
      totalDisplay = 'Total = 12';
    } else if (this.handTotal > 21) {
      totalDisplay = 'Bust ' + this.handTotal;
      this.isBust = true;
    } else {
      totalDisplay = 'Total = ' + this.handTotal;
    }
    if (this.player.hand.length + 1 > 5) {
      this.shouldStackCards = true;
      this.stackCenterPx =  (this.cardContainer.nativeElement.offsetWidth / 2) - (( this.player.hand.length) * 20);
      (this.totalBody.nativeElement as HTMLElement).style.setProperty('--stackLeftMove', this.stackCenterPx + 'px');
    } else {
      this.shouldStackCards = false;
    }
    return totalDisplay;
  }
  canSplit() {
    return this.player.hand.length === 2 && this.player.hand[0].card === this.player.hand[1].card;
  }
  canDouble() {
    let isGoodDouble = false;
    if (this.player.hand.reduce(this.dealingService.addCards, {value: 0}).value === 10 && this.player.hand.length === 2) {
      isGoodDouble = true;
    }
    if (this.player.hand.reduce(this.dealingService.addCards, {value: 0}).value === 11 && this.player.hand.length === 2) {
      isGoodDouble = true;
    }
    return isGoodDouble;
  }
  hitPlayer(playerNum) {
    this.hit.emit(playerNum);
  }
  doubleDownPlayer(playerNum) {
    this.doubleDown.emit(playerNum);
  }
  stay(playerNum) {
    this.nextPlayerTurn.emit(playerNum);
  }
  splitHand(playerNum) {
    this.split.emit(playerNum);
  }
  checkDealer() {
    if (this.player.isDealer) {
      this.xMovement = 0;
      this.yMovement = 0;
    }
  }
  removeCards() {
    while (this.player.hand.length) {
      this.player.hand.pop();
    }
  }
}
