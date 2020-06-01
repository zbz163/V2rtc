// import * as messageAction from '../components/actions/ActionType_meeting'
// import types from '../server/action/login/actionType';
import * as types from './actionType';

export default (state = '', action) => {
  switch (action.type) {
    case types.LOGIN_SUCCESS_RESULT: {
      return '1'
    }

    case types.LOGIN_ERROR_RESULT: {
      return '2'
    }
    case types.LOGOUT_SUCCESS: {
      return '3'
    }
    default: {
      return state;
    }
  }
}