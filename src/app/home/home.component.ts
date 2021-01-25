import {AfterViewInit, Component, ElementRef, HostListener, OnInit, ViewChild} from '@angular/core';
import {animate, style, transition, trigger} from '@angular/animations';
import {DealingService} from '../dealing.service';
import {fromEvent} from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [
    trigger('showingCountBubble', [
      transition(':enter', [
        style({ opacity: '0'}),
        animate('400ms ease-in', style({opacity: '1'}))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({opacity: 0}))
      ])
    ]),
  ]
})
export class HomeComponent implements OnInit, AfterViewInit {
  /* Black jack dealing order
    1. deal 1 card to players first face up.
    2. deal 1 card to dealer face down
    3. deal 2nd card to players face up
    4. deal 2nd card to dealer face up
   */

  pages = [
    {name: 'Home', url: ''},
    {name: 'Rules', url: ''},
    {name: 'Counting', url: ''},
    {name: 'Contact', url: ''}
  ];
  players = [
    {num: 0, hand: [], isTurn: false, win: '', isDealer: false, count: 0, winCount: 0, loseCount: 0, children : [], parent: null},
    {num: 1, hand: [], isTurn: false, win: '', isDealer: false, count: 0, winCount: 0, loseCount: 0, children : [], parent: null},
    {num: 2, hand: [], isTurn: false, win: '', isDealer: false, count: 0, winCount: 0, loseCount: 0, children : [], parent: null}
  ];
  dealer = {num: this.players.length, hand: [], isTurn: false, win: '', isDealer: true, count: 0, parent: null};
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
  isAnimationDisabled = false;
  winnersUpdated = false;
  isCheckedCountHints = true;
  showCountBubble = false;
  currentSplits = 0;
  isMobile = false;
  @ViewChild('dealerHand', {static: false}) dealerHand: ElementRef;
  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.code === 'Space' && !this.hasStarted) {
      this.startRound();
    }
  }
  constructor(private dealingService: DealingService, private totalBody: ElementRef) {
  }
  ngOnInit() {
    this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    // start with 1 player on mobile devices
    if (this.isMobile) {
      this.players.pop();
      this.players.pop();
    }
    this.populateDeck();
    this.setShoots();
    fromEvent(window, 'scroll').subscribe(e => {
      const dealerScroreCoods = document.getElementById('countDataPoints' ).getBoundingClientRect();
      if (dealerScroreCoods.top <= -5) {
        this.showCountBubble = true;
      } else {
        this.showCountBubble = false;
      }
    });
  }

  ngAfterViewInit() {
    const clientRect = this.dealerHand.nativeElement.getBoundingClientRect();
    const xOfDealer = clientRect.x + (clientRect.width / 2);
    const yOfDealer = clientRect.y + (clientRect.height / 2);
    this.dealingService.setDealerScreenLocation({x: xOfDealer, y: yOfDealer});
    this.dealingService.dealerHandReady.next(this.dealingService.getDealerScreenLocation());
  }
  addPlayers() {
    this.resetPlayerHands();
    const newPlayer = {num: this.players.length, hand: [], isTurn: false, win: '',
      isDealer: false, count: 0,  winCount: 0, loseCount: 0, children : [], parent: null};
    this.players.push(newPlayer);
  }
  subtractPlayers() {
    this.resetPlayerHands();
    this.players.pop();
  }
  gameRestart() {
    this.populateDeck();
    this.setShoots();
    this.tableReset();
    this.players = [
      {num: 0, hand: [], isTurn: false, win: '', isDealer: false, count: 0,  winCount: 0, loseCount: 0, children : [], parent: null},
      {num: 1, hand: [], isTurn: false, win: '', isDealer: false, count: 0,  winCount: 0, loseCount: 0, children : [], parent: null},
      {num: 2, hand: [], isTurn: false, win: '', isDealer: false, count: 0,  winCount: 0, loseCount: 0, children : [], parent: null}
    ];
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
            value,
            dd: false
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
    this.hasStarted = true;
    if (this.sixDeckCardArray.length < 78 ) {
      this.gameRestart();
    }

    this.tableReset().then(value => {
      this.initialDeal();
    });
  }
  async tableReset() {
    this.winnersUpdated = false;
    this.dealingService.sweep.next('sweep');
    if (this.sixDeckCardArray.length !== 312) {
      await this.delay();
    }
    this.resetPlayerHands();
    // this.resetPlayerHands();
    this.dealer = {num: this.players.length, hand: [], isTurn: false, win: '', isDealer: true, count: 0, parent: null};
    this.dealerTotal = '';
    this.currentSplits = 0;
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
    this.initialHandCount();
    this.initialCount1Card(this.dealer, 1);
    this.addRunningCountAfterInitialHandDeal();
    const theoreticalTrueCount =  Math.round(( this.runningCount / this.decksRemaining ) * 10) / 10;
    this.trueCount = theoreticalTrueCount;
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
    return new Promise(resolve => setTimeout(resolve, 600));
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
    card.dd = true;
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
      hand: [],
      isTurn: false,
      win: '',
      isDealer: false,
      count: 0,
      winCount: 0,
      loseCount: 0,
      children : [],
      parent: playerNum
    };
    this.isAnimationDisabled = true;
    this.players.splice(nextPlayerNum, 0, splitPlayer);
    this.players[playerNum].children.push(nextPlayerNum); // add splice player relationship.
    const splitCard = this.players[playerNum].hand.pop();
    if (splitCard.value === 1) {
      splitCard.value = 11;
      this.players[playerNum].hand[0].value = 11;
    }
    for (let i = playerNum + 2; i < this.players.length; i ++) {
      this.players[i].num = this.players[i].num + 1;
    }
    this.dealer.num = this.players.length;
    this.initialCount1Card(this.players[playerNum], 0);
    await this.delay();
    this.isAnimationDisabled = false;
    const card1 = this.deal();
    this.players[playerNum].hand.push(card1);
    this.updateCardCount(this.players[playerNum], card1);

    this.players[nextPlayerNum].hand.push(splitCard);
    this.initialCount1Card(this.players[nextPlayerNum], 0);
    await this.delay();
    const card2 = this.deal();
    this.players[nextPlayerNum].hand.push(card2);
    this.updateCardCount(this.players[nextPlayerNum], card2);
    // figure out who's turn it is.
    if (splitCard.card === 'A') {
      this.nextPlayerTurn(nextPlayerNum);
    } else if (this.players[playerNum].hand.reduce(this.dealingService.addCards, {value: 0}).value === 21) {
      this.nextPlayerTurn(playerNum);
    } else {
      this.players[playerNum].isTurn = true;
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
    const count = this.cardCountValue(player.hand[cardNum]);
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
    const count = this.cardCountValue(card);
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
        // scroll player into view if their turn
        this.scrollToPlayer(nextPlayer);
      } else if (this.twoAceHand(this.players[nextPlayer])) {
        this.checkAndModifyAces(this.players[nextPlayer]);
        this.players[nextPlayer].isTurn = true;
        this.scrollToPlayer(nextPlayer);
      } else {
        if (nextPlayer < this.players.length - 1) {
          this.nextPlayerTurn(nextPlayer);
        } else {
          this.scrollToPlayer(this.dealer.num);
          this.dealerAction();
        }
      }
    } else {
      this.scrollToPlayer(this.dealer.num);
      this.dealerAction();
    }
  }
  scrollToPlayer(playerNum) {
    // scroll player into view if their turn
    const element = document.getElementById('player' + playerNum);
    element.scrollIntoView({ block: 'end', behavior: 'smooth' });
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

  async determineWinners() {
    await this.delay();
    if (this.dealerTotal > 21) {
      for (const player of this.players) {
        const playerTotal = player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
        if (playerTotal <= 21 ) {
          player.win = 'Win';
          player.winCount += 1;
        } else {
          player.win = 'Lose';
          player.loseCount += 1;
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
            player.winCount += 1;
          }
        } else if (playerTotal > this.dealerTotal && playerTotal <= 21) {
          player.win = 'Win';
          player.winCount += 1;
        } else if (playerTotal === this.dealerTotal) {
          player.win = 'Push';
        } else {
          player.win = 'Lose';
          player.loseCount += 1;
        }
      }
    }
    this.decksRemaining = Math.round((this.sixDeckCardArray.length / this.cardsInDeck) * 10) / 10;
    // if running count greater than 0 find out truecount otherwise true count is zero.
    const theoreticalTrueCount =  Math.round(( this.runningCount / this.decksRemaining ) * 10) / 10;
    this.trueCount = theoreticalTrueCount;
    this.optimalBetUnit = this.trueCount >= 2 ? Math.round((this.trueCount - 1) * 10) / 10 : 1;
    this.hasStarted = false;
    this.winnersUpdated = true;
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
    }
    currentValue = player.hand.reduce(this.dealingService.addCards, {value: 0}).value;
    return currentValue;
  }
  modifyAces(player) {
    // find the first Ace and set the value to 11
    for (const card of player.hand) {
      if (card.value === 11) {
        card.value = 1;
        break;
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

  playerTitle(player) {
    let playerTitle = '';
    this.currentSplits = 0;
    if (player.parent !== null) {
      playerTitle = 'Player Split';
    } else {
      for (let i = 0; i < player.num; i++) {
        if (this.players[i].parent !== null) {
          this.currentSplits++;
        }
      }
      playerTitle = 'Player ' + (player.num + 1 - this.currentSplits);
    }

    return playerTitle;
  }

  resetPlayerHands() {
    for ( let i = this.players.length - 1; i > -1; i--) {
      if (this.players[i].children.length > 0) {
        // tslint:disable-next-line:prefer-for-of
        for ( let j = 0; j < this.players[i].children.length; j++) {
          const childPos = this.players[i].children[j];
          this.players[i].winCount += this.players[childPos].winCount;
          this.players[i].loseCount += this.players[childPos].loseCount;
          this.players.splice(childPos, 1);
        }
      }
    }

    // retain wins and loses and player number
    for (let i = 0; i < this.players.length; i++) {
      this.players[i] = {
        num: i,
        hand: [],
        isTurn: false,
        win: '',
        isDealer: false,
        count: 0,
        winCount: this.players[i].winCount,
        loseCount: this.players[i].loseCount,
        children : [],
        parent: null
      };
    }
  }
}
