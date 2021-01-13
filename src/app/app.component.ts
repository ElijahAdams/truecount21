import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
/* Black jack dealing order
  1. deal 1 card to players first face up.
  2. deal 1 card to dealer face down
  3. deal 2nd card to players face up
  4. deal 2nd card to dealer face up
 */

  populateDeck() {
    // build array with 6 decks of each card
  }

  randomCard() {
    // card a random number between the indicies of available card. 0 through 311 -1 for each card removed.
  }
}
