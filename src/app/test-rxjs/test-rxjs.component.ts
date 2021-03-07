import { Component, OnInit, ChangeDetectionStrategy, Injectable, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { from, fromEvent, Observable, of, throwError } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { catchError, debounceTime, distinctUntilChanged, map, pluck, retry, switchMap } from 'rxjs/operators';
import jsonpG from 'jsonp-good';

interface JsonpRes {
  q:string;
}
@Injectable()
class WikiService{
  readonly baiduUrl = 'https://www.baidu.com/sugrec'
  readonly url = 'https://zh.wikipedia.org/w/api.php?action=opensearch&format=json&limit=5&origin=*&search=';
  list(keyword:string): Observable<string[]> {
    return ajax.getJSON(this.url+keyword)
    .pipe(map( item => item[1]));
  }

  // Promise
  // baiduList(keyword:string): Promise<JsonpRes[]> {
  //   return jsonpG({
  //     url: this.baiduUrl,
  //     params: {
  //       prod: 'pc',
  //       from: 'pc_web',
  //       wd:keyword,
  //     },
  //     funcName:'jQuery110203052522071732855_1604236886158',
  //   })
  //   .then((res : {g:JsonpRes[]}) => res.g);
  // }

  baiduList(keyword:string): Observable<JsonpRes[]> {
    return from(
      jsonpG({
        url: this.baiduUrl,
        params: {
          prod: 'pc',
          from: 'pc_web',
          wd:keyword,
        },
        funcName:'jQuery110203052522071732855_1604236886158',
      }).then((res : {g:JsonpRes[]}) => {
        return res.g;
      })
    )
  }

}
@Component({
  selector: 'app-test-rxjs',
  template: `
    <h1>wiki</h1>
    <div class="autocomplete">
      <input #input class="form-control" placeholder="search..." />
      <ul class="list-group mt-2">
        <li class="list-group-item" *ngFor="let item of list">{{item}}</li>
      </ul>
    </div>
    <h1>baidu</h1>
    <div class="autocomplete">
      <input #baiduInput class="form-control" placeholder="search..." />
      <ul class="list-group mt-2">
        <li class="list-group-item" *ngFor="let baiduItem of baiduList">{{baiduItem.q}}</li>
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
  baiduList:JsonpRes[] = [];
  // list$:Observable<string[]>;
  @ViewChild('input', {static:true}) private inputEl:ElementRef;
  @ViewChild('baiduInput',{static:true}) private baiduInputEl:ElementRef;
  constructor(
    private wikiServe:WikiService,
    private cdr: ChangeDetectorRef
    ) {
  }

  ngOnInit(): void {
    // this.wikiServe.baiduList('我')
    // .then(
    //   data=>{
    //     console.log('a',data)
    //   }
    // )
  }
  ngAfterViewInit():void {
    fromEvent(this.inputEl.nativeElement,'input')
    .pipe(
      debounceTime(500),
      pluck('target','value'),
      distinctUntilChanged(),
      switchMap((value:string) =>  {
        return value? this.wikiServe.list(<string>value): of([]);
      }),
      catchError(err =>throwError(err)),
      retry(2),
    )
    .subscribe( data => {
      console.log('wikiInput',data);
      this.list = data;
      this.cdr.markForCheck();
    }, error =>{
      console.log('err',error);
    });

    fromEvent(this.baiduInputEl.nativeElement,'input')
    .pipe(
      debounceTime(500),
      pluck('target','value'),
      distinctUntilChanged(),
      switchMap((value:string) =>  {
        return value? this.wikiServe.baiduList(<string>value): of([]);
      }),
      catchError(err =>throwError(err)),
      retry(2),
    )
    .subscribe( data => {
      console.log('baiduInput',data);
      this.baiduList = data;
      this.cdr.markForCheck();
    }, error =>{
      console.log('err',error);
    });
  }
}
