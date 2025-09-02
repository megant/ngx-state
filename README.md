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
  id: number;
  type: string;
  brand: string;
  model: string;
  year: number;
}
```

The `StateService`:

```ts
import { Injectable } from '@angular/core';
import { ArrayState } from 'ngx-states';
import { Vehicle } from './vehicle';

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
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Vehicle } from './vehicle';

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

We will also need a `VehicleDataComponent`

```ts
import { Component, Input } from '@angular/core';
import { Vehicle } from './vehicle';

@Component({
  selector: 'app-vehicle-data',
  template: `
    <div *ngIf="selectedVehicle">
      <h2>{{ selectedVehicle.make }} {{ selectedVehicle.model }}</h2>
      <p>Year: {{ selectedVehicle.year }}</p>
      <p>Color: {{ selectedVehicle.color }}</p>
    </div>
    <div *ngIf="!selectedVehicle">
      <p>No vehicle selected.</p>
    </div>
  `
})
export class VehicleDataComponent {
  @Input() selectedVehicle!: Vehicle;
}
```

Let's expand the `StatesService` now.

```ts
import { Injectable } from '@angular/core';
import { ArrayState, State } from 'ngx-states';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from './vehicle';

@Injectable()
export class StatesService {
  public vehicles: ArrayState<Vehicle> = new ArrayState<Vehicle>();
  public selectedVehicleId: State<number> = new State<number>();

  // Returns a Vehicle identified by the selectedVehicleId state
  public get selectedVehicle(): Observable<Vehicle | undefined> {
    return this.selectedVehicleId.state.pipe(
      map(id => this.vehicles.getFirstItem(vehicle => vehicle.id === id))
    );
  }
}
```

In our high-level AppComponent, we need to do the following

```ts
import { Component } from '@angular/core';
import { StatesService } from './states-service';
import { VehicleSelectorComponent } from './vehicle-selector.component';
import { VehicleDataComponent } from './vehicle-data.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div>
      <app-vehicle-selector (onVehicleSelected)="states.selectedVehicleId.set($event)"></app-vehicle-selector>
      <app-vehicle-data [selectedVehicle]="states.selectedVehicle | async"></app-vehicle-data>
    </div>
  `,
  imports: [VehicleSelectorComponent, VehicleDataComponent]
})
export class AppComponent {
  constructor(public states: StatesService) {
    this.setVehicles(); // Call the method in the constructor
  }

  private setVehicles(): void {
    const vehicles: Vehicle[] = [
      { id: 1, type: 'Car', brand: 'Toyota', model: 'Camry', year: 2020 },
      { id: 2, type: 'Truck', brand: 'Ford', model: 'F-150', year: 2021 },
      { id: 3, type: 'SUV', brand: 'Honda', model: 'CR-V', year: 2019 },
      { id: 4, type: 'Sedan', brand: 'BMW', model: '3 Series', year: 2022 },
      { id: 5, type: 'Coupe', brand: 'Chevrolet', model: 'Camaro', year: 2021 }
    ];

    this.states.vehicles.set(vehicles); // Set the vehicles in the state
  }
}
```

This is just one way to get the selected vehicle's data by ID. The magic happens in the `StatesService`'s `selectedVehicle` 
getter, where we subscribe to changes in the `selectedVehicleId` state variable and return the first item from the `vehicles` 
list (with getFirstItem()) that matches the predicate, meaning its id corresponds to the selected vehicle's id. 
However, this still seems a bit complicated in this form. What if we approached vehicle selection and data display 
in an even simpler way?

Let's change the `StatesService` to use `KeyValueState` instead of `ArrayState` for the vehicles state.

```ts
import { Injectable } from '@angular/core';
import { KeyValueState, State } from 'ngx-states';
import { Vehicle } from './vehicle';
import { KeyValuesState } from "./key-values-state";

@Injectable()
export class StatesService {
  public vehicles: KeyValueState<number, Vehicle> = new KeyValueState<number, Vehicle>();
  public selectedVehicleId: State<number> = new State<number>();
}
```

In the above example, we are now storing key-value pairs in the state. The key will be the vehicle's ID, and the 
value will be a `Vehicle`. Accordingly, we also need to modify the `setVehicles` method of the `AppComponent`.
As you can see, we removed the getter method from the StatesService because we won't need it.

```ts
import { Component } from '@angular/core';
import { StatesService } from './states-service';
import { VehicleSelectorComponent } from './vehicle-selector.component';
import { VehicleDataComponent } from './vehicle-data.component';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <div>
      <app-vehicle-selector (onVehicleSelected)="states.selectedVehicleId.set($event)"></app-vehicle-selector>
      <app-vehicle-data [selectedVehicle]="states.vehicles.stateOfKey(states.selectedVehicleId.state | async) | async"></app-vehicle-data>
    </div>
  `,
  imports: [VehicleSelectorComponent, VehicleDataComponent]
})
export class AppComponent {
  constructor(public states: StatesService) {
    this.setVehicles(); // Call the method in the constructor
  }

  private setVehicles(): void {
    const vehicles: Record<number, Vehicle> = {
      1: { id: 1, type: 'Car', brand: 'Toyota', model: 'Camry', year: 2020 },
      2: { id: 2, type: 'Truck', brand: 'Ford', model: 'F-150', year: 2021 },
      3: { id: 3, type: 'SUV', brand: 'Honda', model: 'CR-V', year: 2019 },
      4: { id: 4, type: 'Sedan', brand: 'BMW', model: '3 Series', year: 2022 },
      5: { id: 5, type: 'Coupe', brand: 'Chevrolet', model: 'Camaro', year: 2021 }
    };

    this.states.vehicles.set(vehicles); // Set the vehicles in the state
  }
}
```

The magic happens in the template here:

```html
<app-vehicle-data [selectedVehicle]="states.vehicles.stateOfKey(states.selectedVehicleId | async) | async"></app-vehicle-data>
```

We are not subscribing to the entire vehicles state, only to the state of the value identified by the specific key (`stateOfKey()`). 
The key is the selectedVehicleId, which is set by the vehicleSelector.

## State Types ##

To summarize, we distinguish between four basic types of state. These are:

- **State<T>**: A simple state of type `<T>`
- **ArrayState<T>**: An array state of type `<T>`, with array operation functions
- **KeyValueState<KEY, VALUE>**: A key-value pair type state
- **KeyValuesState<KEY, VALUE>**: A key-value pair type state where the value is an array of `<VALUE>`, meaning each key is associated with multiple values of type `<VALUE>`

## Events ##

In a `State<T>`, the `.state` property is an `Observable<T>`, so you can subscribe to it in the usual 
way and use various RxJS operators and functions. However, to avoid repeating boilerplate code, the 
different `State` types provide several convenience functions. For handling state changes, for instance, each state type has an `onChange` method. Let’s look at an example of this!

The traditional way to subscribe to changes looks like this:

```ts
const counter: State<number> = new State<number>();

counter.state.subscribe(value => console.log(value));

// or
counter.state.subscribe({
  next: value => console.log(value)
})
```

However, the NGX States method is simpler than the traditional way:

```ts
counter.onChange(value => console.log(value))

// or
counter.onChange({
  next: value => console.log(value)
})
```

The parameters can be the familiar `PartialObserver`, or the deprecated, separate (and optional) callback arguments.

```ts
counter.onChange(
  value => console.log('The value is changed to: ', value), 
  error => console.error('The error is: ', error),
  () => console.log('Completed')
)

// or
counter.onChange({
  next: value => console.log('The value is changed to: ', value),
  error: error => console.error('The error is: ', error),
  complete: () => console.log('Completed')
})
```

The only required parameter of the `onChange` method is the `next` callback function or its equivalent 
in `PartialObserver`. All other parameters are optional.

Please note that the `onChange` method will only execute the callback functions when there is an 
actual change in the state value. If the state receives the same value as before, no callback is 
triggered. If you want a callback to be called every time the state is set, even if it’s set to 
the same value as before, it’s recommended to use the `onSet` event handler. The `onSet` method 
has the same parameters as the `onChange` method.

### Auto unsubscribe ###

There is also a special optional parameter for cases where we want to use a state event handler 
located in a singleton service (`providedIn: 'root'`). Since singleton services in Angular have 
a lifecycle that lasts as long as the application runs, it’s possible that in a component subscribing 
to a state’s onChange or onSet event in that service, we end up repeatedly subscribing every time 
the component is reinitialized (for example, if the user navigates away and then returns). This could 
lead to multiple callbacks being triggered on a state change, rather than a single one.

To address this, state event handler methods offer an optional `callerComponent` parameter, which is 
a reference to the component where we subscribed to the event handlers. This alone isn’t enough, 
however; in such cases, we also need to use the `@UntilDestroy()` component decorator. By passing 
the component reference to the event handler, subscriptions to the events are limited to the component’s 
lifecycle, automatically unsubscribing when the component is destroyed. This prevents duplicate 
subscriptions to the state event handlers.

Let's look at an example.

We have a singleton state service, like:

```ts
import { Injectable } from '@angular/core';
import { State } from 'ngx-states';

@Injectable({
  providedIn: 'root'
})
export class StatesService {
  public currentNumber: State<number> = new State<number>();
}
```

And the component:

```ts
import { Component } from '@angular/core';
import { StatesServce } from './states.service';
import { UntilDestroy } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: 'app-vehicle-data',
  template: ``
})
export class TestComponent implements OnInit {
  constructor(private states: StatesService) {}

  ngOnInit() {
    // The second "this" parameter is the callerComponent parameter and refers to TestComponent itself
    this.states.currentNumber.onChange(
      number => console.log('The current number is: ', currentNumber), 
      this
    );
  }
}
```

## State functions summary ##

| State                                                                                           | Method               | Description                                                                                                     | Parameters                                                                                                                                                                                                                  |
|-------------------------------------------------------------------------------------------------|----------------------|-----------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `State<T>`, `ArrayState<T>`, <br> `KeyValueState<KEY, VALUE>`, <br>`KeyValuesState<KEY, VALUE>` | `onChange`           | Subscribes to `changes` in state, calling a function whenever the state changes.                                | `callback`: PartialObserver\<T> or <br> observer: (value: VALUE) => void, <br> error?: (error: any) => void, <br> complete?: () => void, <br> `callerComponent`: Optional component reference for auto unsubscribe          |
| `State<T>`, `ArrayState<T>`, <br> `KeyValueState<KEY, VALUE>`, <br>`KeyValuesState<KEY, VALUE>` | `onSet`              | Triggers the callback function `every time` the state is set, regardless of value change.                       | same as `onChange`                                                                                                                                                                                                          |
| `State<T>`, `ArrayState<T>`, <br> `KeyValueState<KEY, VALUE>`, <br>`KeyValuesState<KEY, VALUE>` | `onFirstChange`      | Subscribes to the `first change` in state, calling a function whenever the state changes.                       | same as onChange, without `callerComponent` optional parameter                                                                                                                                                              |
| `State<T>`, `ArrayState<T>`, <br> `KeyValueState<KEY, VALUE>`, <br>`KeyValuesState<KEY, VALUE>` | `onFirstSet`         | Triggers the callback function the `first time` the state is set, regardless of value change.                   | same as `onFirstChange`                                                                                                                                                                                                     |
| `State<T>`, `ArrayState<T>`, <br> `KeyValueState<KEY, VALUE>`, <br>`KeyValuesState<KEY, VALUE>` | `onFromSecondChange` | Subscribes to changes in state `except the first change`, calling a function whenever the state changes.        | same as `onFirstChange`                                                                                                                                                                                                     |
| `State<T>`, `ArrayState<T>`, <br> `KeyValueState<KEY, VALUE>`, <br>`KeyValuesState<KEY, VALUE>` | `onFromSecondSet`    | Triggers the callback function every time the state is set `except the first time`, regardless of value change. | same as `onFirstChange`                                                                                                                                                                                                     |
| `ArrayState<T>`                                                                                 | `length`             | Length property of the state's value.                                                                           |                                                                                                                                                                                                                             |
| `ArrayState<T>`                                                                                 | `includes`           | The method checks whether the searched value can be found in the array state and returns a boolean.             | `value`: T - the searched value                                                                                                                                                                                             |
| `ArrayState<T>`                                                                                 | `hasItem`            | Similar to `include`, but returns an Observable<boolean>                                                        | `item`: T - the searched item <br> `exactMatch`: boolean - The parameter allows you to specify whether it should return true only for an exact match or also if the searched value is found within any part of an element.  |
|                                                                                                 |                      |                                                                                                                 |                                                                                                                                                                                                                             |
