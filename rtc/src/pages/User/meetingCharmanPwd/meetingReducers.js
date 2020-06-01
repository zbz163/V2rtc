import * as types from './actionType';

export default (state = '', action) => {
    switch (action.type) {
        case types.JOIN_MEETING_SUCCESS:{
            return action.data.meetingInfo;
        }
        default: {
            return state
        }
    }
}