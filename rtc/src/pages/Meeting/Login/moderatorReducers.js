import * as types from './actionType';
export default (state = '', action) => {
  switch (action.type) {
    case types.OWNER_PIN_SUCCESS_RESULT: {
      return '1'
    }
    case types.OWNER_PIN_ERROR_RESULT: {
      return '2'
    }
    case types.OWNER_PIN_Log_Out_RESULT: {
      return '3'
    }
    default: {
      return state;
    }
  }
}