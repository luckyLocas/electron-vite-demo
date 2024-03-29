export interface IReduxStore {
  loginInfo?: object | null;
}

const initState: IReduxStore = {
  loginInfo: localStorage.getItem('login_info') ? JSON.parse(localStorage.getItem('login_info')!) : null,
};

export enum IReduxActionType {
  CHANGE_LOGIN_INFO = 'CHANGE_LOGIN_INFO',
}

export interface IReduxAction {
  type: IReduxActionType;
  data: any;
}

const reducers = (state = initState, action: IReduxAction): IReduxStore => {
  switch (action.type) {
    case IReduxActionType.CHANGE_LOGIN_INFO:
      return { ...state, loginInfo: action.data };
    default:
      return state;
  }
};

export default reducers;
