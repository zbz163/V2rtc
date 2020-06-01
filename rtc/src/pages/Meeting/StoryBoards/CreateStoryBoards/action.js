import * as ActionType from './actionType';

export const uploadImg = (data)=>{
    return {
        type : ActionType.UPLOAD_IMG,
        file:data.file
    }
}
export const saveStoryBoards = (data)=>{
    return {
        type : ActionType.SAVE_STORY_BOARDS,
        data:data
    }
}
export const storyboardFetch = (data)=>{
    return {
        type : ActionType.STORYBOARD_FETCH,
        stbId:data.stbId
    }
}
export const initCreateStb = ()=>{
    return {
        type : ActionType.INIT_CREATE_STB
    }
}
export const updateStb = (data)=>{
    return {
        type : ActionType.UPDATE_STB,
        stbId:data.stbId,
        data:data.data
    }
}
