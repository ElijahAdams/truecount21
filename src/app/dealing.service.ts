import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DealingService {
  dealerScreenLocation;
  dealerHandReady = new ReplaySubject();
  constructor() { }
  addCards(a, b) {
    return {value: a.value + b.value};
  }

  getDealerScreenLocation() {
    return this.dealerScreenLocation;
  }

  setDealerScreenLocation(screenLocation) {
    this.dealerScreenLocation = screenLocation;
  }
}
