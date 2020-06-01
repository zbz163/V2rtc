import * as types from './actionType';

export default (state = [], action) => {
    switch(action.type) {
      case types.SEND_MESSAGE: {
        console.error('======SEND_MESSAGE',action)
        return [
          ...state,
          action
        ]
      }

      case types.TV_ADD_CHAT_MESSAGE: {
        console.error('======TV_ADD_CHAT_MESSAGE',action)
        return [
          ...state,
          {
            action  : action.type,
            author  : action.payload.author,
            message : action.payload.message,
            time    : action.payload.time
          }
        ];
      }
      // case types.TRANSLATOR_RESPONSE:{
      //   console.log('====TRANSLATOR_RESPONSE',action)
      //   console.log('====TRANSLATOR_RESPONSE===state',state)
      //   for(let i= 0; i < state.length; i++){
      //     if(state[i]._id ==  action.data._id){
      //       state[i].translations = action.data.translations;
      //       console.log('--------state',state);
      //       return state;
      //     }
      //   }
      // }
      default: {
        return state;
      }
    }
  }