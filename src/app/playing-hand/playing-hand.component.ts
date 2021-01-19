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
  ElementRef, AfterViewInit
} from '@angular/core';
import {DealingService} from '../dealing.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-playing-hand',
  templateUrl: './playing-hand.component.html',
  styleUrls: ['./playing-hand.component.scss'],
  animations: [trigger('cardDealing', [
    transition(':enter', [
      style({transform: 'translate({{x}}px , {{y}}px)'}),
      animate('500ms ease-in', style({transform: 'translate(0%, 0%)'}))
    ], {params: {x: 1, y: 1}}),
    transition(':leave', [
      animate('500ms ease-in', style({transform: 'translate(-2000px, -2000px)'}))
    ])
    ]
  )]
})
export class PlayingHandComponent implements OnInit, AfterViewChecked, AfterViewInit {
  @Input() player;
  @Output() nextPlayerTurn = new EventEmitter();
  @Output() hit = new EventEmitter();
  @Output() doubleDown = new EventEmitter();
  @Output() split = new EventEmitter();
  @ViewChild('cardContainer', {static: false}) cardContainer: ElementRef;
  isBust = false;
  handTotal;
  shouldStackCards = false;
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
    });
  }
  ngAfterViewInit() {
    // center of self
    const clientRect = this.cardContainer.nativeElement.getBoundingClientRect();
    this.playerX = clientRect.x + (clientRect.width);
    this.playerY = clientRect.y + (clientRect.height / 2);
    this.xMovement = (screen.width / 2) - this.playerX;
    this.yMovement -= this.playerY;
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
    if (this.player.hand.length + 1 > 4) {
      this.shouldStackCards = true;
      this.stackCenterPx =  (this.cardContainer.nativeElement.offsetWidth / 2) - (( this.player.hand.length) * 20);
      (this.totalBody.nativeElement as HTMLElement).style.setProperty('--stackLeftMove', this.stackCenterPx + 'px');
    }
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
}
