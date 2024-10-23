import { BehaviorSubject, Observable, PartialObserver, Subscription } from "rxjs";
import { distinctUntilChanged, filter, first, skip } from "rxjs/operators";
import { isNullOrUndefined } from "../helpers/type.helper";
import { BaseState } from "./base-state";

export class State<T> extends BaseState {
  protected subject: BehaviorSubject<T>;

  public get state(): Observable<T> {
    return this.subject.asObservable();
  }

  public get value(): T {
    return this.subject.getValue();
  }

  constructor(initialValue?: T) {
    super();
    this.subject = new BehaviorSubject<T>(initialValue ?? null as T);
  }

  public set(value: T, bypassChangeDetection = false): Observable<T> {
    this.bypassChangeDetection = bypassChangeDetection;
    this.subject.next(value);
    return this.state;
  }

  public onSet(observer: (value: T) => void, callerComponent?: object): void;
  public onSet(
    observer: PartialObserver<T>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onSet(observer?: ((value: T) => void) | PartialObserver<T>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
    let observable = this.state.pipe(
      filter(x => !isNullOrUndefined(x) && !this.bypassChangeDetection),
    );
    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete,
      callerComponent
    });
  }

  public onChange(observer: (value: T) => void, callerComponent?: object): void;
  public onChange(
    observer: PartialObserver<T>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onChange(observer?: ((value: T) => void) | PartialObserver<T>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
    let observable = this.state.pipe(
      distinctUntilChanged(),
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

  public onFirstSet(observer?: ((value: T) => void) | PartialObserver<T>, error?: (error: any) => void, complete?: () => void): Subscription {
    const observable = this.state.pipe(
      filter(x => !isNullOrUndefined(x) && !this.bypassChangeDetection),
      first()
    )
    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete
    });
  }

  public onFirstChange(observer?: ((value: T) => void) | PartialObserver<T>, error?: (error: any) => void, complete?: () => void): Subscription {
    const observable = this.state.pipe(
      distinctUntilChanged(),
      filter(x => !isNullOrUndefined(x) && !this.bypassChangeDetection),
      first()
    )
    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete
    });
  }

  public onFromSecondSet(observer: (value: T) => void, callerComponent?: object): void;
  public onFromSecondSet(
    observer: PartialObserver<T>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onFromSecondSet(observer?: ((value: T) => void) | PartialObserver<T>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
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

  public onFromSecondChange(observer: (value: T) => void, callerComponent?: object): void;
  public onFromSecondChange(
    observer: PartialObserver<T>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onFromSecondChange(observer?: ((value: T) => void) | PartialObserver<T>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
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
