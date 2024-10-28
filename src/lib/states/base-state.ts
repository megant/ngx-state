import { Subscription } from "rxjs";
import { SubscriptionData } from "../types/subscription-data";
import { isNullOrUndefined } from "../helpers/type.helper";
import { untilDestroyed } from "@ngneat/until-destroy";

export abstract class BaseState {
  protected bypassChangeDetection: boolean = false;

  protected prepareSubscription(data: SubscriptionData): Subscription {
    if (typeof data.error === "object") {
      data.callerComponent = data.error;
      data.error = undefined;
    }

    if (typeof data.complete === "object") {
      data.callerComponent = data.complete;
      data.complete = undefined;
    }

    if (!isNullOrUndefined(data.callerComponent)) {
      data.observable = data.observable.pipe(untilDestroyed(data.callerComponent));
    }

    if (typeof data.observer === 'function') {
      return data.observable.subscribe(data.observer, data.error, data.complete);
    } else {
      return data.observable.subscribe(data.observer);
    }
  }
}
