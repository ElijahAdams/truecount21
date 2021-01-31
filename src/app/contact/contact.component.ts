import { Component, OnInit } from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {EmailService} from './email.service';
import {MatSnackBar} from '@angular/material/snack-bar';
@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm;
  isSending = false;
  constructor(private es: EmailService, private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.contactForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      message: new FormControl('', Validators.required)
    });
  }
  onSubmit() {
    const emailInfo = {
      name: this.contactForm.controls.name.value,
      email: this.contactForm.controls.email.value,
      message: this.contactForm.controls.message.value
    };
    this.isSending = true;
    this.es.sendEmail(emailInfo).subscribe(data => {
      this.isSending = false;
      this.contactForm.reset();
      const message = 'Email Sent';
      const action = 'close';
      this.openSnackBar(message, action);
    }, err => {
      this.isSending = false;
      const message = 'Sorry something went wrong';
      const action = 'close';
      this.openSnackBar(message, action);
    });
  }

  openSnackBar(message, action) {

    this.snackBar.open(message, action, {
      duration: 4000,
      verticalPosition: 'top'
    });
  }
}
