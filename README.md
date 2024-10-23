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

A `State` object essentially has three key properties. 

1. The `.state` property is an Observable\<Type>, which can be subscribed to in the usual way 
and can also be used with the async pipe commonly known in templates. 
2. The `.value` property directly contains the current value of the State.
3. The `.set(value: Type)` method allows us to set the current value of the state

Usage:

```ts
const testState: State<string> = new State<string>();

// reactive way of getting the value of a state
testState.state.subscribe(value => console.log(value));

// regular way
console.log(testState.value)

// it will trigger the subscription's callback
testState.set('Lorem Ipsum')
```

In an Angular template:

```angular2html
<div class="container">
  {{ testState.state | async }}
</div>
```

Now, let's take a look at a very simple state service.

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

## Advanced Examples ##

Now, let's look at a slightly more complex, classic example. Let's assume we have an 
array that contains Vehicle types and their data, and we want to display the data of 
the Vehicle type selected from a dropdown menu.

The `Vehicle` type looks like this:

```ts
export type Vehicle = {
  type: string;
  brand: string;
  model: string;
  year: number;
}
```

The `StateService`:

```ts
import { Injectable } from '@angular/core';

@Injectable()
export class StatesService {
  public vehicles: ArrayState<Vehicle> = new ArrayState<Vehicle>();
}
```

In this example, we encounter a new state, the ArrayState. The ArrayState<Type> 
indicates that in this state, arrays of Type[] can be stored. Of course, this 
could be done using State<Type[]> as well, but ArrayState provides several additional 
convenience features compared to State.

We need a VehicleSelectorComponent:

```ts
@Component({
  selector: 'app-vehicle-selector',
  template: `
    <div>
      <label for="vehicleSelect">Select a vehicle type:</label>
      <select id="vehicleSelect" (change)="onVehicleChange($event.target.value)">
        <option *ngFor="let vehicle of vehicles" [value]="vehicle.id">{{ vehicle.type }}</option>
      </select>
    </div>
  `
})
export class VehicleSelectorComponent {
  @Input() vehicles: Vehicle[] = []; // List of vehicles passed from parent component
  @Output() onVehicleSelected: EventEmitter<number> = new EventEmitter<number>(); // Emits the selected vehicle's id

  onVehicleChange(selectedVehicleId: string): void {
    this.onVehicleSelected.emit(Number(selectedVehicleId)); // Emit selected vehicle id
  }
}
```










