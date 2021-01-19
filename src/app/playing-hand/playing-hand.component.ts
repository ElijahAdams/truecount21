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
  ElementRef
} from '@angular/core';
import {DealingService} from '../dealing.service';

@Component({
  selector: 'app-playing-hand',
  templateUrl: './playing-hand.component.html',
  styleUrls: ['./playing-hand.component.scss']
})
export class PlayingHandComponent implements OnInit, AfterViewChecked {
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
  constructor(private dealingService: DealingService,
              private cdr: ChangeDetectorRef,
              private totalBody: ElementRef) { }
  ngOnInit() {}
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
