import * as ActionType from './actionType';

export const screen_share_start = (data) => {
    return {
        type     : ActionType.SCREEN_SHARE_START,
        userId   : data.userID,
        userName : data.userName
    }
}

export const screen_share_started = () => {
    return {
        type : ActionType.TV_SCREEN_SHARE_STARTED
    }
}

export const screen_share_stoped = (data) => {
    return {
        type   : ActionType.CONNECTION_STOP_SHARING,
        screenStreamId : data.participantId
    }
}

export const screen_share_remote = () => {
    return {
        type : ActionType.TV_SCREEN_SHARE_SET_REMOTE
    }
}