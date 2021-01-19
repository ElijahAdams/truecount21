/* tslint:disable:no-trailing-whitespace prefer-const */
import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {DealingService} from './dealing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  /* Black jack dealing order
    1. deal 1 card to players first face up.
    2. deal 1 card to dealer face down
    3. deal 2nd card to players face up
    4. deal 2nd card to dealer face up
   */
  /* Formula for Card counting.
    (10 through A) = - 1, (2 through 6) = + 1
    remaining Decks = Number of future cards / 52
    Running Count/ Number of Decks Remaining = true count
   */
  // Display betting units.
  players = [
    {num: 0, hand: [], isTurn: false, win: '', isDealer: false, count: 0},
    {num: 1, hand: [], isTurn: false, win: '', isDealer: false, count: 0},
    {num: 2, hand: [], isTurn: false, win: '', isDealer: false, count: 0}
    ];
  dealer = {num: this.players.length, hand: [], isTurn: false, win: '', isDealer: true, count: 0};
  dealerTotal;
  singleDeckCardArray = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  suites = ['spades', 'clubs', 'hearts', 'diamonds'];
  sixDeckCardArray = [];
  pastCardsLength = 0;
  hasStarted = false;
  runningCount = 0;
  trueCount = 0;
  optimalBetUnit = 1;
  decksRemaining = 6;
  cardsInDeck = 52;
  @ViewChild('dealerHand', {static: false}) dealerHand: ElementRef;
  constructor(private dealingService: DealingService, private totalBody: ElementRef) {
  }
  ngOnInit() {
    this.populateDeck();
    this.setShoots();
  }

  ngAfterViewInit() {
    const clientRect = this.dealerHand.nativeElement.getBoundingClientRect();
    const xOfDealer = clientRect.x + (clientRect.width / 2);
    const yOfDealer = clientRect.y + (clientRect.height / 2);
    this.dealingService.setDealerScreenLocation({x: xOfDealer, y: yOfDealer});
    this.dealingService.dealerHandReady.next(this.dealingService.getDealerScreenLocation());
  }
  gameRestart() {
    this.populateDeck();
    this.setShoots();
    this.tableReset();
    this.pastCardsLength = 0;
    this.runningCount = 0;
    this.trueCount = 0;
    this.optimalBetUnit = 1;
    this.decksRemaining = 6;
  }
  populateDeck() {
    this.sixDeckCardArray = [];
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
  setShoots() {
    this.pastCardsLength = 312 - this.sixDeckCardArray.length;
    (this.totalBody.nativeElement as HTMLElement).style.setProperty('--futureHeight', (this.sixDeckCardArray.length / 6) + 'px');
    (this.totalBody.nativeElement as HTMLElement).style.setProperty('--pastHeight', (this.pastCardsLength / 6) + 'px');
  }
  getCardValue(card) {
    if (card !== 'A') {
      return 10;
    }
    return 11;
  }

  startRound() {
    if (this.sixDeckCardArray.length < 78 ) {
      this.gameRestart();
    }
    this.tableReset().then(value => {
      this.initialDeal();
      this.hasStarted = true;
    });
  }
  async tableReset() {
    this.dealingService.sweep.next('sweep');
    if (this.hasStarted) {
      await this.delay();
    }
    this.players = [
      {num: 0, hand: [], isTurn: false, win: '', isDealer: false, count: 0},
      {num: 1, hand: [], isTurn: false, win: '', isDealer: false, count: 0},
      {num: 2, hand: [], isTurn: false, win: '', isDealer: false, count: 0}
    ];
    this.dealer = {num: this.players.length, hand: [], isTurn: false, win: '', isDealer: true, count: 0};
    this.dealerTotal = '';
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
    // this.dealer.hand.push({ card: '9', suite: 'spades', value: 9});
    for (const player of this.players) {
      await this.delayedCardDeal(player);
    }
    await this.delayedCardDeal(this.dealer);
    this.initialHandCount();
    this.initialCount1Card(this.dealer, 1);
    this.addRunningCountAfterInitialHandDeal();
    this.dealerTotal = this.dealer.hand.reduce(this.dealingService.addCards, {value: 0}).value;
    // if dealer has blackjack check pushes and go to next round;
    if (this.dealerTotal === 21 ) {
      this.dealerAction();
    } else {
      this.nextPlayerTurn(-1);
    }
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
    const card = this.deal();
    this.players[event].hand.push(card);
    this.updateCardCount(this.players[event], card);
    const playerTotal = this.checkAndModifyAces(this.players[event]);
    if (playerTotal > 21) {
      this.nextPlayerTurn(event);
    }
    if (playerTotal === 21) {
      this.nextPlayerTurn(event);
    }
  }
  doubleDown(event) {
    const card = this.deal();
    this.players[event].hand.push(card);
    this.updateCardCount(this.players[event], card);
    this.checkAndModifyAces(this.players[event]);
    this.nextPlayerTurn(event);
  }
  async split(playerNum) {
    const nextPlayerNum = playerNum + 1;
    this.players[playerNum].isTurn = false;
    const splitPlayer = {
      num: nextPlayerNum,
      hand: [this.players[playerNum].hand[1]],
      isTurn: false,
      win: '',
      isDealer: false,
      count: 0
    };
    this.players.splice(nextPlayerNum, 0, splitPlayer);
    this.players[playerNum].hand.pop();
    for (let i = playerNum + 2; i < this.players.length; i ++) {
      this.players[i].num = this.players[i].num + 1;
    }
    this.dealer.num = this.players.length;
    // this.delayedCardDeal(this.players[playerNum]);
    this.initialCount1Card(this.players[playerNum], 0);
    await this.delay();
    const card1 = this.deal();
    this.players[playerNum].hand.push(card1);
    this.updateCardCount(this.players[playerNum], card1);
    // await this.delayedCardDeal(this.players[nextPlayerNum]);
    this.initialCount1Card(this.players[nextPlayerNum], 0);
    await this.delay();
    const card2 = this.deal();
    this.players[nextPlayerNum].hand.push(card2);
    this.updateCardCount(this.players[nextPlayerNum], card2);
    this.players[playerNum].isTurn = true;
    if (this.players[playerNum].hand.reduce(this.dealingService.addCards, {value: 0}).value === 21) {
      this.nextPlayerTurn(playerNum);
    }
  }

  deal() {
    // remainding card must be greater than 1 to deal mathmetically. but greater than 40 for black jack game.
    const dealtCardIndex = this.randomCard(this.sixDeckCardArray.length);
    const cardDelt = this.sixDeckCardArray[dealtCardIndex];
    this.sixDeckCardArray.splice(dealtCardIndex, 1);
    this.setShoots();
    return cardDelt;
  }
  initialHandCount() {
    for (const player of this.players) {
      let count = 0;
      player.hand.forEach(card => {
        count = this.cardCountValue(card);
        player.count += count;
      });
    }
  }
  initialCount1Card(player, cardNum) {
    let count = this.cardCountValue(player.hand[cardNum]);
    player.count = count;
  }
  addRunningCountAfterInitialHandDeal() {
    let runningCount = this.dealer.count;
    this.players.forEach(player => {
      runningCount += player.count;
    });
    this.runningCount += runningCount;
  }
  updateCardCount(player, card) {
    let count = this.cardCountValue(card);
    this.runningCount += count;
    player.count += count;
  }
  cardCountValue(card) {
    let count = 0;
    if ((/[a-zA-Z]/).test(card.card)) {
      count = count - 1;
    } else if (card.value === 10 ) {
      count = count - 1;
    }
    if (card.value < 7) {
      count = count  + 1;
    }
    return count;
  }
  nextPlayerTurn(playerNum) {
    const nextPlayer =  playerNum + 1;
    if (playerNum > -1) {
      this.players[playerNum].isTurn = false;
    }
    if (nextPlayer < this.players.length) {
      const nextPlayerTotal = this.players[nextPlayer].hand.reduce(this.dealingService.addCards, {value: 0}).value;
      if (nextPlayerTotal < 21 ) {
        this.players[nextPlayer].isTurn = true;
      } else if (this.twoAceHand(this.players[nextPlayer])) {
        this.checkAndModifyAces(this.players[nextPlayer]);
        this.players[nextPlayer].isTurn = true;
      } else {
        if (nextPlayer < this.players.length - 1) {
          this.nextPlayerTurn(nextPlayer);
        } else {
          this.dealerAction();
        }
      }
    } else {
      this.dealerAction();
    }
  }
  twoAceHand(player) {
    let isTwoAces = false;
    if (player.hand.length === 2
      && player.hand[0].card === 'A'
      && player.hand[1].card === 'A') {
      isTwoAces = true;
    }
    return isTwoAces;
  }
  multipleAcesSoft(player) {
    const aces = player.hand.filter(card => {
      return card.card === 'A';
    });
    const isMultiAces = aces.length > 1 ? true : false;
    const acePresent = player.hand.find( card => {
      return card.value === 11;
    });

    return isMultiAces && acePresent;
  }

  async dealerAction() {
    if (this.dealer.isDealer) {
      await this.delay();
      this.dealer.isDealer = false;
      this.updateCardCount(this.dealer, this.dealer.hand[0]);
    }

    if (this.allPlayersBust()) {
      this.determineWinners();
    } else if (this.dealerTotal < 17) {
      await this.delay();
      const card = this.deal();
      this.dealer.hand.push(card);
      this.updateCardCount(this.dealer, card);
      this.dealerTotal = this.dealer.hand.reduce(this.dealingService.addCards, {value: 0}).value;
      this.dealerTotal = this.checkAndModifyAces(this.dealer);
      this.dealerAction();
    } else if (this.dealerTotal === 17 && this.multipleAcesSoft(this.dealer)) {
      this.modifyAces(this.dealer);
      this.dealerTotal = this.dealer.hand.reduce(this.dealingService.addCards, {value: 0}).value;
      this.dealerAction();
    } else if (this.dealerTotal === 17 && this.hasAce(this.dealer) ) {
      await this.delay();
      const card = this.deal();
      this.dealer.hand.push(card);
      this.updateCardCount(this.dealer, card);
      this.dealerTotal = this.checkAndModifyAces(this.dealer);
      this.dealerAction();
    } else if (this.twoAceHand(this.dealer)) {
      this.dealerTotal = this.checkAndModifyAces(this.dealer);
      this.dealerAction();
    } else {
      this.determineWinners();
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
        if (playerTotal === 21 && player.hand.length === 2) {
          if (this.dealerTotal === 21 && this.dealer.hand.length === 2 ) {
            player.win = 'Push';
          } else {
            player.win = 'Win';
          }
        } else if (playerTotal > this.dealerTotal && playerTotal <= 21) {
          player.win = 'Win';
        } else if (playerTotal === this.dealerTotal) {
          player.win = 'Push';
        } else {
          player.win = 'Lose';
        }
      }
    }
    this.decksRemaining = Math.round((this.sixDeckCardArray.length / this.cardsInDeck) * 10) / 10;
    // if running count greater than 0 find out truecount otherwise true count is zero.
    const theoreticalTrueCount =  Math.round(( this.runningCount / this.decksRemaining ) * 10) / 10;
    this.trueCount = this.runningCount > 0 ? theoreticalTrueCount : 0;
    const trueCountFloor = Math.floor(this.trueCount);
    this.optimalBetUnit = trueCountFloor > 1 ? trueCountFloor - 1 : 1;
    this.hasStarted = false;
  }

  hasAce(player) {
    const acePresent = player.hand.find( card => {
      return card.value === 11;
    });
    return acePresent;
  }
  checkAndModifyAces(player) {
    let currentValue = player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
    if (currentValue > 21) {
      this.modifyAces(player);
      this.modifyAces(player);
    }
    currentValue = player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
    return currentValue;
  }
  modifyAces(player) {
    // find the first Ace and set the value to 11
    for (const card of player.hand) {
      if (card.value === 11) {
        card.value = 1;
        return;
      }
    }
  }

  allPlayersBust() {
    let allBusted = true;
    for (const player of this.players) {
     if (player.hand.reduce(this.dealingService.addCards, {value: 0}).value <= 21 ) {
       allBusted = false;
     }
    }
    return allBusted;
  }

}
