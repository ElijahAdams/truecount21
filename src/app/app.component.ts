/* tslint:disable:no-trailing-whitespace */
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
  dealer = {
    hand: []
  };
  players = [
    {num: 1, hand: []},
    {num: 2, hand: []},
    {num: 3, hand: []},
    {num: 4, hand: []},
    ];
  currentPlayerTurn = 1;
  singleDeckCardArray = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  suites = ['spades', 'clubs', 'hearts', 'diamonds'];
  sixDeckCardArray = [];
  hasStarted = false;
  ngOnInit() {
    this.populateDeck();
  }
  populateDeck() {
    let newCard;
    this.singleDeckCardArray.forEach(card => {
      for (let i = 0; i < 6; i++) {

        const value = isNaN(parseInt(card, 10)) ? this.getCardValue(card) : parseInt(card, 10);

        this.suites.forEach(suite => {
          newCard = {
            card,
            suite,
            value
          };
          this.sixDeckCardArray.push(newCard);
        });
      }
    });
  }
  getCardValue(card) {
    if (card !== 'A') {
      return 10;
    }
    return 11;
  }

  startRound() {
    this.initialDeal();
    this.hasStarted = true;
  }

  async initialDeal() {
    // deal first card to all
    for (const player of this.players) {
      await this.delayedCardDeal(player);
    }
    await this.delayedCardDeal(this.dealer);
    // deal second card to all
    for (const player of this.players) {
      await this.delayedCardDeal(player);
    }
    await this.delayedCardDeal(this.dealer);
  }

  async delayedCardDeal(player) {
    await this.delay();
    player.hand.push(this.deal());
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 700));
  }
  randomCard(max) {
    // card a random number between the indicies of available card. 0 through 311 -1 for each card removed.
    return Math.floor(Math.random() * Math.floor(max));
  }
  addCards(a, b) {
    return {value: a.value + b.value};
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
    const cardDelt = this.sixDeckCardArray[dealtCardIndex];
    this.sixDeckCardArray.splice(dealtCardIndex, 1);
    return cardDelt;
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
