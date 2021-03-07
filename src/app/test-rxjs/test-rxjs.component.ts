import { Component, OnInit, ChangeDetectionStrategy, Injectable, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { fromEvent, Observable, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { debounceTime, distinctUntilChanged, map, pluck, switchMap } from 'rxjs/operators';
@Injectable()
class WikiService{
  readonly url = 'https://zh.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&origin=*&search=';
  list(keyword:string): Observable<string[]> {
    return ajax.getJSON(this.url+keyword)
    .pipe(map( item => item[1]));
  }
}
@Component({
  selector: 'app-test-rxjs',
  template: `
    <div class="autocomplete">
      <input #input class="form-control" placeholder="search..." />
      <ul class="list-group mt-2">
        <li class="list-group-item" *ngFor="let item of list">{{item}}</li>
      </ul>
    </div>
  `,
  styles: [
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:[WikiService]
})
export class TestRxjsComponent implements OnInit, AfterViewInit {
  list:string[] = [];
  @ViewChild('input', {static:true}) private inputEl:ElementRef;
  constructor(
    private wikiServe:WikiService,
    private cdr: ChangeDetectorRef
    ) {
  }

  ngOnInit(): void {
  }
  ngAfterViewInit():void {
    fromEvent(this.inputEl.nativeElement,'input')
    .pipe(
      debounceTime(500),
      pluck('target','value'),
      distinctUntilChanged(),
      switchMap((value:string) =>  {
        return value? this.wikiServe.list(<string>value): of([]);
      })
    )
    .subscribe( data => {
      console.log(data);
      this.list = data;
      this.cdr.markForCheck();
    })
  }
}
