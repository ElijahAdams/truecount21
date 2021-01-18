/* tslint:disable:no-trailing-whitespace */
import {Component, OnInit} from '@angular/core';
import {DealingService} from './dealing.service';

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
  dealer = {num: 3, hand: [], isTurn: false, win: ''};
  players = [
    {num: 0, hand: [], isTurn: false, win: ''},
    {num: 1, hand: [], isTurn: false, win: ''},
    {num: 2, hand: [], isTurn: false, win: ''}
    ];
  dealerTotal;
  singleDeckCardArray = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  suites = ['spades', 'clubs', 'hearts', 'diamonds'];
  sixDeckCardArray = [];
  hasStarted = false;
  actionReady = false;
  constructor(private dealingService: DealingService) {

  }
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
    this.dealer.hand = [];
    for (const player of this.players) {
      player.hand = [];
      player.win = '';
    }

    for (const player of this.players) {
      await this.delayedCardDeal(player);
    }
    await this.delayedCardDeal(this.dealer);
    for (const player of this.players) {
      await this.delayedCardDeal(player);
    }
    await this.delayedCardDeal(this.dealer);
    // check if dealer has blackjack?
    this.nextPlayerTurn(-1);
  }

  async delayedCardDeal(player) {
    await this.delay();
    player.hand.push(this.deal());
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 700));
  }

  randomCard(max) {
    // grab random number between the indicies of available cards. 0 through 311 -1 for each card removed.
    return Math.floor(Math.random() * Math.floor(max));
  }

  hit(event) {
    this.players[event].hand.push(this.deal());
    const playerTotal = this.players[event].hand.reduce(this.dealingService.addCards, {value: 0}).value;
    if (playerTotal > 21) {
      this.nextPlayerTurn(event);
    }
    if (playerTotal === 21) {
      this.nextPlayerTurn(event);
    }
  }

  deal() {
    // remainding card must be greater than 1 to deal mathmetically. but greater than 40 for black jack game.
    const dealtCardIndex = this.randomCard(this.sixDeckCardArray.length);
    const cardDelt = this.sixDeckCardArray[dealtCardIndex];
    this.sixDeckCardArray.splice(dealtCardIndex, 1);
    return cardDelt;
  }

  nextPlayerTurn(playerNum) {
    const nextPlayer =  playerNum + 1;
    if (playerNum > -1) {
      this.players[playerNum].isTurn = false;
    }
    if (nextPlayer < 3) {
      const nextPlayerTotal = this.players[nextPlayer].hand.reduce(this.dealingService.addCards, {value: 0}).value;
      if (nextPlayerTotal < 21 ) {
        this.players[nextPlayer].isTurn = true;
      } else {
        if (nextPlayer < 2) {
          this.nextPlayerTurn(nextPlayer);
        } else {
          this.dealerAction();
        }
      }
    } else {
      this.dealerAction();
    }
  }

  async dealerAction() {
    this.dealerTotal = this.dealer.hand.reduce(this.dealingService.addCards, {value: 0}).value;
    if (this.dealerTotal < 17) {
      await this.delayedCardDeal(this.dealer);
      this.dealerAction();
    } else {
      // end round

      this.determineWinners();
      this.hasStarted = false;
    }
  }
  determineWinners() {
    if (this.dealerTotal > 21) {
      for (const player of this.players) {
        const playerTotal = player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
        if (playerTotal <= 21 ) {
          player.win = 'Win';
        } else {
          player.win = 'Lose';
        }
      }
    } else {
      for (const player of this.players) {
        const playerTotal = player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
        if (playerTotal > this.dealerTotal && playerTotal <= 21) {
          player.win = 'Win';
        } else if (playerTotal === this.dealerTotal) {
          player.win = 'Push';
        } else {
          player.win = 'Lose';
        }
      }
    }
  }
}
