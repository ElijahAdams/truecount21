import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DealingService {
  finishedInitialDeal = new BehaviorSubject(null);
  currentPlayerTurn = new BehaviorSubject(null);
  constructor() { }

}
