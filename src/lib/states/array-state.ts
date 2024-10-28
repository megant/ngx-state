import { BehaviorSubject, Observable, PartialObserver, Subscription } from "rxjs";
import { distinctUntilChanged, filter, first, map, skip } from "rxjs/operators";
import { isNullOrUndefined } from "../helpers/type.helper";
import { BaseState } from "./base-state";

export class ArrayState<T> extends BaseState {
  protected subject: BehaviorSubject<T[]>;

  public get state(): Observable<T[]> {
    return this.subject.asObservable();
  }

  public get value(): T[] {
    return this.subject.getValue();
  }

  public get length(): number {
    return this.value.length;
  }

  public includes(value: T): boolean {
    return this.value.includes(value);
  }

  public hasItem(item: T, exactMatch = true): Observable<boolean> {
    return this.state.pipe(
      map(record => {
        if (typeof item === 'string' && !exactMatch) {
          return record.some(i => (i as unknown as string).includes(item));
        } else {
          return record.includes(item);
        }
      }),
      distinctUntilChanged()
    );
  }

  constructor(initialValue?: T[]) {
    super();
    this.subject = new BehaviorSubject<T[]>(initialValue ?? []);
  }

  public set(value: T[], bypassChangeDetection = false): Observable<T[]> {
    this.bypassChangeDetection = bypassChangeDetection;
    this.subject.next(value);
    return this.state;
  }

  public stateOfItem(predicate: (item: T) => boolean): Observable<T> {
    return this.state.pipe(
      map(items => items.find(predicate)),
      filter((item): item is T => item !== undefined),
      first());
  }

  public stateOfItems(predicate: (item: T) => boolean): Observable<T[]> {
    return this.state.pipe(map(items => items.filter(predicate)),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr))
    );
  }

  public getFirstItem(predicate: (item: T) => boolean): T | undefined {
    return this.value.find(predicate);
  }

  public getItems(predicate: (item: T) => boolean): T[] {
    return this.value.filter(predicate);
  }

  public add(value: T, unique?: boolean, bypassChangeDetection = false): void {
    this.bypassChangeDetection = bypassChangeDetection;
    const newSet = this.value;
    const isUnique = unique ?? true;
    if ((isUnique && !newSet.includes(value)) ||
        !isUnique) {
        newSet.push(value);
        this.set(newSet);
    }
  }

  public remove(value: T, bypassChangeDetection = false): void {
    this.bypassChangeDetection = bypassChangeDetection;
    const newSet = this.value;
    this.set(newSet.filter(x => x !== value));
  }

  public onSet(
    observer: PartialObserver<T[]>,
    callerComponent?: object
  ): void;
  public onSet(
    observer: (value: T[]) => void,
    callerComponent?: object
  ): void;
  public onSet(
    observer: (value: T[]) => void,
    error?: (error: any) => void,
    callerComponent?: object
  ): void;
  public onSet(
    observer: (value: T[]) => void,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onSet(observer?: ((value: T[]) => void) | PartialObserver<T[]>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
    let observable = this.state.pipe(
      filter(x => !isNullOrUndefined(x) && !this.bypassChangeDetection)
    );

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete,
      callerComponent
    });
  }

  public onChange(
    observer: PartialObserver<T[]>,
    callerComponent?: object
  ): void;
  public onChange(
    observer: (value: T[]) => void,
    callerComponent?: object
  ): void;
  public onChange(
    observer: (value: T[]) => void,
    error?: (error: any) => void,
    callerComponent?: object
  ): void;
  public onChange(
    observer: PartialObserver<T[]>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onChange(observer?: ((value: T[]) => void) | PartialObserver<T[]>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
    let observable = this.state.pipe(
      distinctUntilChanged(),
      filter(x => !isNullOrUndefined(x) && !this.bypassChangeDetection));

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete,
      callerComponent
    });
  }

  public onFirstSet(observer?: ((value: T[]) => void) | PartialObserver<T[]>, error?: (error: any) => void, complete?: () => void): Subscription {
    const observable = this.state.pipe(
      filter(x => !isNullOrUndefined(x) && x.length > 0 && !this.bypassChangeDetection),
      first()
    );

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete
    });
  }

  public onFirstChange(observer?: ((value: T[]) => void) | PartialObserver<T[]>, error?: (error: any) => void, complete?: () => void): Subscription {
    const observable = this.state.pipe(
      distinctUntilChanged(),
      filter(x => !isNullOrUndefined(x) && x.length > 0 && !this.bypassChangeDetection),
      first()
    );

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete
    });
  }

  public onFromSecondSet(
    observer: PartialObserver<T[]>,
    callerComponent?: object
  ): void;
  public onFromSecondSet(
    observer: (value: T[]) => void,
    callerComponent?: object
  ): void;
  public onFromSecondSet(
    observer: PartialObserver<T[]>,
    error?: (error: any) => void,
    callerComponent?: object
  ): void;
  public onFromSecondSet(
    observer: PartialObserver<T[]>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onFromSecondSet(observer?: ((value: T[]) => void) | PartialObserver<T[]>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
    let observable = this.state.pipe(
      filter(x => !isNullOrUndefined(x) && !this.bypassChangeDetection),
      skip(1)
    );

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete,
      callerComponent
    });
  }

  public onFromSecondChange(
    observer: PartialObserver<T[]>,
    callerComponent?: object
  ): void;
  public onFromSecondChange(
    observer: (value: T[]) => void,
    callerComponent?: object
  ): void;
  public onFromSecondChange(
    observer: PartialObserver<T[]>,
    error?: (error: any) => void,
    callerComponent?: object
  ): void;
  public onFromSecondChange(
    observer: PartialObserver<T[]>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onFromSecondChange(observer?: ((value: T[]) => void) | PartialObserver<T[]>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
    let observable = this.state.pipe(
      distinctUntilChanged(),
      filter(x => !isNullOrUndefined(x) && !this.bypassChangeDetection),
      skip(1)
    );

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete,
      callerComponent
    });
  }
}
