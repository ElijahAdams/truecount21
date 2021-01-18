/* tslint:disable:no-trailing-whitespace prefer-const */
import {Component, Input, OnInit, AfterViewChecked, Output, ChangeDetectorRef, EventEmitter} from '@angular/core';
import {DealingService} from '../dealing.service';
import has = Reflect.has;

@Component({
  selector: 'app-playing-hand',
  templateUrl: './playing-hand.component.html',
  styleUrls: ['./playing-hand.component.scss']
})
export class PlayingHandComponent implements OnInit, AfterViewChecked {
  @Input() player;
  @Output() nextPlayerTurn = new EventEmitter();
  @Output() hit = new EventEmitter();
  @Output() split = new EventEmitter();
  isBust = false;
  handTotal;
  constructor(private dealingService: DealingService,
              private cdr: ChangeDetectorRef) { }
  ngOnInit() {

  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }

  determineTotal() {
    this.isBust = false;
    let totalDisplay = '';
    this.handTotal = this.player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
    if ( this.handTotal === 21 && this.player.hand.length === 2) {
      totalDisplay = 'blackJack';
    } else if (this.player.hand.length === 2
      && this.player.hand[0].card === 'A'
      && this.player.hand[1].card === 'A') {
      totalDisplay = 'Total 12';
    } else if (this.handTotal > 21) {
      totalDisplay = 'Bust ' + this.handTotal;
      this.isBust = true;
    } else {
      totalDisplay = 'Total ' + this.handTotal;
    }
    return totalDisplay;
  }
  canSplit() {
    return this.player.hand.length === 2 && this.player.hand[0].card === this.player.hand[1].card;
  }
  hitPlayer(playerNum) {
    this.hit.emit(playerNum);
  }
  stay(playerNum) {
    this.nextPlayerTurn.emit(playerNum);
  }
  splitHand(playerNum) {
    this.split.emit(playerNum)
  }
  checkSoft() {

  }

}
