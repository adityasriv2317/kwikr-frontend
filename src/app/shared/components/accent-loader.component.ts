import { Component, input } from '@angular/core';
import { LucideLoaderCircle } from '@lucide/angular';

@Component({
  selector: 'app-accent-loader',
  styleUrl: './accent-loader.component.css',
  imports: [LucideLoaderCircle],
  template: `
    <div class="accent-loader" role="status" aria-live="polite">
      <svg lucideLoaderCircle class="accent-loader-icon" [size]="size()" [strokeWidth]="2.5"></svg>
      @if (label()) { <span>{{ label() }}</span> }
    </div>
  `
})
export class AccentLoaderComponent {
  label = input('Loading...');
  size = input(28);
}
