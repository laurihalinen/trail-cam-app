import { Injectable, signal, computed } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageStore {
  private _images = signal<any[]>([]);
  private _filter = signal<'all' | 'animals'>('all');
  private _search = signal<string>('');

  images = this._images.asReadonly();
  filter = this._filter.asReadonly();
  search = this._search.asReadonly();

  setImages(images: any[]) {
    this._images.set(images);
  }

  setFilter(filter: 'all' | 'animals') {
    this._filter.set(filter);
  }

  setSearch(value: string) {
    this._search.set(value.toLowerCase());
  }

  filteredImages = computed(() => {
    let imgs = this._images();

    if (this._filter() === 'animals') {
      imgs = imgs.filter((i) => i.hasAnimal);
    }

    const search = this._search();
    if (search) {
      imgs = imgs.filter((i) => i.labels?.some((l: string) => l.toLowerCase().includes(search)));
    }

    return [...imgs].sort((a, b) => b.createdAt - a.createdAt);
  });
}
