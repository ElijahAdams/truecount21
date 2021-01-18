import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, ReplaySubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DealingService {
  constructor() { }
  addCards(a, b) {
    return {value: a.value + b.value};
  }
}
