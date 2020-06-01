import * as types from './actionType';

export default (state = '', action) => {
    switch (action.type) {
      case types.STORYBOARD_FETCH_BEGIN: {
        return true
      }
  
      case types.STORYBOARD_FETCH_END: {
        return false
      }
      default: {
        return state;
      }
    }
  }