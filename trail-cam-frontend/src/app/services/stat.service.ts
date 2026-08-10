import { Injectable, computed, inject } from '@angular/core';
import { ImageStore } from '../stores/image.store';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  private imageStore = inject(ImageStore);

  private animalLabels = [
    'Deer',
    'Moose',
    'Fox',
    'Wolf',
    'Bear',
    'Rabbit',
    'Hare',
    'Bird',
    'Duck',
    'Swan',
    'Goose',
    'Squirrel',
    'Dog',
    'Cat',
  ];

  animalStatistics = computed(() => {
    const images = this.imageStore.images();

    const statistics: Record<string, number> = {};

    for (const image of images) {
      for (const label of image.labels) {
        if (this.animalLabels.includes(label)) {
          statistics[label] = (statistics[label] || 0) + 1;
        }
      }
    }

    return statistics;
  });
}
