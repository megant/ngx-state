import { BehaviorSubject, Observable, PartialObserver, Subscription } from "rxjs";
import { untilDestroyed } from "@ngneat/until-destroy";
import { distinctUntilChanged, filter, first, map, skip, tap } from "rxjs/operators";
import { isNullOrUndefined } from "../helpers/type.helper";
import { BaseState } from "./base-state";

export class KeyValueState<KEY extends string | number | symbol, VALUE> extends BaseState {

  private _subject: BehaviorSubject<Record<KEY, VALUE>>;
  private readonly _keySeparator = '####';

  public get state(): Observable<Record<KEY, VALUE>> {
    return this._subject.asObservable();
  }

  public stateOfKey(key: KEY, changedStateOnly = true): Observable<VALUE> {
    const state = this.state.pipe(
      filter(record =>
        !isNullOrUndefined(record) &&
      !isNullOrUndefined(record[key]) && !this.bypassChangeDetection),
      map(record => record[key] as VALUE)
    );

    if (changedStateOnly) {
      return state.pipe(distinctUntilChanged())
    }

    return state;
  }

  public stateOfKeys(...keys: any[]): Observable<VALUE> {
    return this.stateOfKey(keys.join(this._keySeparator) as KEY);
  }

  public hasKey(key: KEY, exactMatch = true): Observable<boolean> {
      return this.state.pipe(
        map(record => {
          if (typeof key === 'string' && !exactMatch) {
            return Object.keys(record).some(k => k.includes(key));
          } else {
            return key in record;
          }
        }),
        distinctUntilChanged()
      );
  }

  public get keys(): KEY[] {
    return Object.keys(this.value) as KEY[];
  }

  public getKeysOfIndex(keyIndex: number): string[] {
    return this.keys.map(key => key.toString().split(this._keySeparator)[keyIndex]);
  }

  public get toArray(): VALUE[] {
    return Object.values(this.value);
  }

  public get length(): number {
    return this.toArray.length;
  }

  public get toArrayState(): Observable<VALUE[]> {
    return this.state.pipe(map(x => Object.values(x) as unknown as VALUE[]));
  }

  public get value(): Record<KEY, VALUE> {
    return this._subject.getValue();
  }

  constructor(initialValue?: Record<KEY, VALUE>) {
    super();
    this._subject = new BehaviorSubject<Record<KEY, VALUE>>(initialValue ?? {} as Record<KEY, VALUE>);
  }

  public getValue(key: KEY): VALUE {
    return this.value[key];
  }

  public getValueByKeys(...keys: any[]): VALUE {
    return this.value[keys.map(String).join(this._keySeparator) as KEY];
  }

  public setValue(key: KEY, value: VALUE, bypassChangeDetection = false): Observable<Record<KEY, VALUE>> {
    this.bypassChangeDetection = bypassChangeDetection;
    const newSet = {...this.value};
    newSet[key] = value;
    this._subject.next(newSet);
    return this.state;
  }

  public setValueByKeys(value: VALUE, bypassChangeDetection = false, ...keys: any[]): Observable<Record<KEY, VALUE>> {
    return this.setValue(keys.join(this._keySeparator) as KEY, value, bypassChangeDetection);
  }

  public unset(key: KEY, bypassChangeDetection = false): Observable<Record<KEY, VALUE>> {
    this.bypassChangeDetection = bypassChangeDetection;
    const newSet = this.value;
    delete newSet[key];
    this._subject.next(newSet);
    return this.state;
  }

  public unsetByKeys(bypassChangeDetection = false, ...keys: any[]): Observable<Record<KEY, VALUE>> {
    return this.unset(keys.join(this._keySeparator) as KEY, bypassChangeDetection);
  }

  public reset(bypassChangeDetection = false): Observable<Record<KEY, VALUE>> {
    this.bypassChangeDetection = bypassChangeDetection;
    this._subject.next({} as Record<KEY, VALUE>);
    return this.state;
  }

  public set(record: Record<KEY, VALUE>, bypassChangeDetection = false): Observable<Record<KEY, VALUE>> {
    this.bypassChangeDetection = bypassChangeDetection;
    this._subject.next(record);
    return this.state;
  }

  public onSet(
    observer: (value: Record<KEY, VALUE>) => void,
    callerComponent?: object
  ): void;
  public onSet(
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    callerComponent?: object
  ): void;
  public onSet(
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onSet(
    observer: PartialObserver<Record<KEY, VALUE>>,
    callerComponent?: object
  ): void;
  public onSet(observer?: ((value: Record<KEY, VALUE>) => void) | PartialObserver<Record<KEY, VALUE>>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
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
    observer: (value: Record<KEY, VALUE>) => void,
    callerComponent?: object
  ): void;
  public onChange(
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    callerComponent?: object
  ): void;
  public onChange(
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onChange(
    observer: PartialObserver<Record<KEY, VALUE>>,
    callerComponent?: object
  ): void;
  public onChange(observer?: ((value: Record<KEY, VALUE>) => void) | PartialObserver<Record<KEY, VALUE>>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
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

 public onValueChange(
    key: KEY,
    observer: (value: Record<KEY, VALUE>) => void,
    callerComponent?: object
  ): void;
  public onValueChange(
    key: KEY,
    observer: (value: Record<KEY, VALUE>) => void,
    filterValue?: boolean,
    callerComponent?: object
  ): void;
  public onValueChange(
    key: KEY,
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    callerComponent?: object
  ): void;
  public onValueChange(
    key: KEY,
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    filterValue?: boolean,
    callerComponent?: object
  ): void;
  public onValueChange(
    key: KEY,
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onValueChange(
    key: KEY,
    observer: (value: Record<KEY, VALUE>) => void,
    error?: (error: any) => void,
    complete?: () => void,
    filterValue?: boolean,
    callerComponent?: object
  ): void;
  public onValueChange(
    key: KEY,
    observer: PartialObserver<Record<KEY, VALUE>>,
    callerComponent?: object
  ): void
  public onValueChange(
    key: KEY,
    observer: PartialObserver<Record<KEY, VALUE>>,
    filterValue?: boolean,
    callerComponent?: object
  ): void
  public onValueChange(key: KEY, observer: ((value: VALUE) => void) | PartialObserver<VALUE>, error?: (error: any) => void | object, complete?: () => void, filterValues?: boolean, callerComponent?: object): Subscription {
    filterValues = (filterValues === undefined) ? true : filterValues;

    let observable: Observable<VALUE> = this.state.pipe(
      map(value => value[key]),
      filterValues ? filter(value => !isNullOrUndefined(value) && !this.bypassChangeDetection) : tap(),
      distinctUntilChanged()
    );

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete,
      callerComponent
    });
  }

  public onFirstChange(observer?: ((value: Record<KEY, VALUE>) => void) | PartialObserver<Record<KEY, VALUE>>, error?: (error: any) => void, complete?: () => void): Subscription {
    const observable = this.state.pipe(
      filter(x => !isNullOrUndefined(x) &&
        !this.bypassChangeDetection),
      first()
    );

    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete
    });
  }

  public onFirstNonEmptyChange(observer?: ((value: Record<KEY, VALUE>) => void) | PartialObserver<Record<KEY, VALUE>>, error?: (error: any) => void, complete?: () => void): Subscription {
    const observable = this.state.pipe(
      filter(x => !isNullOrUndefined(x) &&
        Object.keys(x).length > 0 &&
        !this.bypassChangeDetection
      ),
      first()
    )
    return this.prepareSubscription({
      observable,
      observer,
      error,
      complete
    });
  }

  public onFromSecondChange(observer: (value: Record<KEY, VALUE>) => void, callerComponent?: object): void;
  public onFromSecondChange(
    observer: PartialObserver<Record<KEY, VALUE>>,
    error?: (error: any) => void,
    complete?: () => void,
    callerComponent?: object
  ): void;
  public onFromSecondChange(observer?: ((value: Record<KEY, VALUE>) => void) | PartialObserver<Record<KEY, VALUE>>, error?: (error: any) => void, complete?: () => void, callerComponent?: object): Subscription {
    const observable = this.state.pipe(
      untilDestroyed(callerComponent),
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
