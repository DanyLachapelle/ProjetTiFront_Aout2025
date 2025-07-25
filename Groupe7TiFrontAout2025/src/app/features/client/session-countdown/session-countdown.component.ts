import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-session-countdown',
  templateUrl: './session-countdown.component.html',
  styleUrl: './session-countdown.component.css'
})
export class SessionCountdownComponent implements OnInit, OnDestroy {
  timeLeft = 15 * 60; // 15 minutes en secondes
  timer: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(this.timer);
        this.router.navigate(['/menu']);
      }
    }, 1000);
  }

  formatTime(): string {
    const mins = Math.floor(this.timeLeft / 60);
    const secs = this.timeLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  goToMenu() {
    this.router.navigate(['/menu']);
  }
}
