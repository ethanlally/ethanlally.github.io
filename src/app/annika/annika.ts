import { Component, OnDestroy, inject, signal } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Component({
  selector: 'app-annika',
  imports: [],
  templateUrl: './annika.html',
  styleUrl: './annika.css',
})
export class AnnikaComponent implements OnDestroy {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly loveMessages = [
    'I love you',
    'I love you even more',
    'I love you the most',
    'I love you Annika',
    'I love you so much',
    'I love you more than anything',
    'I love everything about you',
    'You are perfect',
    'You are everything to me',
    'You make me feel special',
    "I'm so lucky to have you",
    'You make every day better',
    'You are my favorite person',
    "I'd choose you every time",
    'You mean the world to me',
    "I'm happiest when I'm with you",
    'Being with you feels like home',
    'You make ordinary days feel special',
    "I'm always on your side",
    'You are the best part of my day',
    'I never get tired of loving you',
    'You make me smile without trying',
    "I'm grateful for you every day",
    'There is nobody else like you',
    "You're my person",
    'You make me so happy',
    'I still get excited every time I see you',
    'Every day with you is a good day',
  ];

  readonly randomMessage = signal('');

  constructor() {
    this.title.setTitle('For Annika');
    this.meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
  }

  ngOnDestroy(): void {
    this.title.setTitle('Ethan Lally');
    this.meta.removeTag("name='robots'");
  }

  showRandomMessage(): void {
    const currentMessage = this.randomMessage();
    const choices = this.loveMessages.filter((message) => message !== currentMessage);
    const nextMessage = choices[Math.floor(Math.random() * choices.length)];

    this.randomMessage.set(nextMessage);
  }
}
