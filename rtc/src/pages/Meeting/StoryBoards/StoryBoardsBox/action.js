import * as ActionType from './actionType';

export const showStory = (data)=>{
    return {
        type : ActionType.STORYBOARD_FETCH,
        mode:data.mode,
        stbId:data.stbId
    }
}