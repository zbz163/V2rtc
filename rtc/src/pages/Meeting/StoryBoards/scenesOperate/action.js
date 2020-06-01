import * as ActionType from './actionType';

export const slideNumberChanged = (data)=>{
    return {
        type : ActionType.MEETING_SLIDE_CHANGED,
        number:data.number
    }
}

//setMode
export const setMode = (data)=>{
    return {
        type : ActionType.MEETING_SET_MODE,
        mode:data.mode,
        stbId:data.stbId
    }
}