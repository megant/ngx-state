import { Observable, PartialObserver } from "rxjs";

export type SubscriptionData = {
  observable: Observable<any>,
  observer?: ((value: any) => void) | PartialObserver<any>,
  error?: (error: any) => void,
  complete?: () => void,
  callerComponent?: object
}
