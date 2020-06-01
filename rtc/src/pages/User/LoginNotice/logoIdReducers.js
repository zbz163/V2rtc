import * as types from './actionType';

export default (state = '', action) => {
    switch (action.type) {
        case types.SAVE_LOGID_SUCCESS:{
            return action.data.logID;
        }
        case types.SAVE_LOGID_ERROR:{
            return "";
        }
        case types.SAVE_LOGID_OUT:{
            return "";
        }
        default: {
            return state
        }
    }
}