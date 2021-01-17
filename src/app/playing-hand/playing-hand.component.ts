import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-playing-hand',
  templateUrl: './playing-hand.component.html',
  styleUrls: ['./playing-hand.component.scss']
})
export class PlayingHandComponent implements OnInit {
  @Input() hand;
  constructor() { }
  ngOnInit() {
  }
  addCards(a, b) {
    return {value: a.value + b.value};
  }
}
