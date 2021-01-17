import {Component, Input, OnInit, AfterViewChecked, Output, ChangeDetectorRef, EventEmitter} from '@angular/core';
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
  isCurrentPlayer;
  actionReady;
  playerOptions = {anyOptions: true , hit: false, stay: true, split: false };
  constructor(private dealingService: DealingService,
              private cdr: ChangeDetectorRef) { }
  ngOnInit() {
    this.dealingService.currentPlayerTurn.subscribe(playerNum => {
      this.isCurrentPlayer = playerNum === this.player.num ? true : false;
      // check 21
    });
    this.dealingService.finishedInitialDeal.subscribe(value => {
      this.actionReady = value;
      this.updateOptions();
    });
  }

  ngAfterViewChecked() {
    this.cdr.detectChanges();
  }
  addCards(a, b) {
    return {value: a.value + b.value};
  }
  determineTotal(hand) {
    let handInfo = '';
    let total = '';
    if (hand.reduce(this.addCards, {value: 0}).value === 21 && hand.length === 2) {
      total = 'blackJack';
    } else {
      handInfo = this.softness(hand);
      total = handInfo + ' ' + hand.reduce(this.addCards, {value: 0}).value;
    }
    return total;
  }

  softness(hand) {
    let handInfo = '';
    const hasAce = hand.filter(card => {
      return card.card === 'A';
    });
    // blackjackes don't see this logic.
    // A + 1-9 = soft
    // A + A = soft
    // A + multipleCards with total under 10 = soft
    // A + muttipleCards equaling 10 = 21
    if (hasAce.length > 0) {
      // A + 8 = soft 19 or A + 8 = 12
      if (hasAce.length === 1 && hand.reduce(this.addCards, {value: 0}).value < 21 ) {
        handInfo = 'Soft';
      }
    }
    return handInfo;
  }

  updateOptions() {
    if (this.player.hand.reduce(this.addCards, {value: 0}).value >= 21) {
     this.playerOptions.anyOptions = false;
    }
    if (this.player.hand.reduce(this.addCards, {value: 0}).value < 21) {
      this.playerOptions.hit = true;
    }
    if (this.player.hand.length === 2 ) {
      if (this.player.hand[0].card === this.player.hand[1].card) {
        this.playerOptions.split = true;
      }
    }
  }
  hitPlayer() {
    this.hit.emit(this.player.num);
    this.updateOptions();
    if(!this.playerOptions.anyOptions) {
      this.nextPlayerTurn.emit();
    }
  }
  stay() {
    this.nextPlayerTurn.emit();
  }
}
