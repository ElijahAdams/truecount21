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
  isBust = false;
  actionReady;
  playerOptions = {anyOptions: false , hit: false, stay: true, split: false };
  constructor(private dealingService: DealingService,
              private cdr: ChangeDetectorRef) { }
  ngOnInit() {
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
    if (hasAce.length > 0) {
      if (hasAce.length === 1 && hand.reduce(this.addCards, {value: 0}).value < 21 ) {
        handInfo = 'Soft';
      }
    }
    return handInfo;
  }
  hitPlayer() {
    this.hit.emit(this.player.num);
  }
  stay() {
    this.playerOptions.anyOptions = false;
    this.nextPlayerTurn.emit();
  }

}
