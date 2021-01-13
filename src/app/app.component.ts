import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  /* Black jack dealing order
    1. deal 1 card to players first face up.
    2. deal 1 card to dealer face down
    3. deal 2nd card to players face up
    4. deal 2nd card to dealer face up
   */
  players = [1, 2, 3, 4];
  currentPlayerTurn = 1;
  singleDeckCardArray = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  suites = ['spades', 'clubs', 'hearts', 'diamonds'];
  sixDeckCardArray = [];

  ngOnInit() {
    this.populateDeck();
  }
  startRound() {
  }

  populateDeck() {
    let newCard;
    this.singleDeckCardArray.forEach(card => {
      for (let i = 0; i < 6; i++) {
        this.suites.forEach(suite => {
          newCard = {
            card,
            suite
          };
          this.sixDeckCardArray.push(newCard);
        });
      }
    });
  }

  randomCard(max) {
    // card a random number between the indicies of available card. 0 through 311 -1 for each card removed.
    return Math.floor(Math.random() * Math.floor(max));
  }

  hit() {
    // take a hit card
  }

  stay() {
    // do not take a hit card
  }
  deal() {
    // remainding card must be greater than 1 to deal mathmetically. but greater than 40 for black jack game.
    const dealtCardIndex = this.randomCard(this.sixDeckCardArray.length);
    console.log(this.sixDeckCardArray[dealtCardIndex]);
    this.sixDeckCardArray.splice(dealtCardIndex, 1);
  }
  determineAbility() {
    this.deal();
    if (this.currentPlayerTurn === 4) {
      this.currentPlayerTurn = 0;
    } else {
      this.currentPlayerTurn++;
    }
  }
}
