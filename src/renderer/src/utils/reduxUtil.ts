import { IReduxAction, IReduxActionType, IReduxStore } from '../redux';
import { Store } from 'redux';

export default class ReduxUtil {
  static store: Store<IReduxStore, IReduxAction>;

  static dispatch(type: IReduxActionType, data?: any) {
    this.store.dispatch({ type, data });
  }
}
