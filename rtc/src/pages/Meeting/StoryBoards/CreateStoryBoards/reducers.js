import * as types from './actionType';

export default (state = '', action) => {
  switch (action.type) {
    case types.SAVE_STORY_BOARDS_SUCCESS: {
      console.log('--------save action', action)
      return action.data
    }
    case types.INIT_CREATE_STB_SUCCESS: {
      return action.data
    }

    default: {
      return state;
    }
  }
}