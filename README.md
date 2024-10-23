# NGX States

This is a lightweight Angular State Management library

## The Story

There are numerous state management solutions available for the **Angular framework**, 
each with varying complexity and use cases. However, in my daily work, I needed a 
**lightweight**, **easily understandable**, **boilerplate-free** state management solution, 
and I didn't want to introduce any complex dependencies into the codebase for this purpose. 

I initially liked the approach of keeping shared states between components in regular 
Angular services using BehaviorSubjects, which could then be subscribed to via Observables 
for state changes. But after some of these state services started to become slightly more 
complex, I found myself **constantly repeating the same boilerplate code** in each of these 
state services, which for me was definitely a design red flag.

This was the point when I thought, what if I wrote a generic class that already includes 
everything typically written for such a basic state management. This is how the **State<T>** 
type was created. It became much simpler to instantiate and subscribe to these **State**s 
within a state service compared to doing everything manually. Over time, I needed more and 
more new State types and their different functionalities, which led to the current form of 
the **NGX States** library.

## Basic Usage ##

For example, let's take a look at a very simple state service.

```ts
import { Injectable } from '@angular/core';

@Injectable()
export class StatesService {
  public name: State<string> = new State<string>()
}
```

We have a component that reads this state.

```ts
import { Component } from '@angular/core';
import { State } from 'ngx-states';
import { StatesService } from './states.service'

@Component({
  selector: 'app-name-reader',
  template: `
    <div>
      {{ states.name.state | async }}
    </div>
  `,
})
export class NameReaderComponent {
  constructor(public states: StatesService) {}
}
```

And another one that writes it.

```ts
import { Component } from '@angular/core';
import { State } from 'ngx-states';
import { StatesService } from './states.service'

@Component({
  selector: 'app-name-writer',
  template: `
    <div>
        <input type="text" 
        [ngModel]="states.name.state | async"
        (ngModelChange)="states.name.set($event)">
    </div>
  `,
})
export class NameWriterComponent {
  constructor(public states: StatesService) {}
}
```




