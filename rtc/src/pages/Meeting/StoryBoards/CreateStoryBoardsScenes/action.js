import * as ActionType from './actionType';

export const addScenes = (data)=>{
    return {
        type : ActionType.ADD_SCENES,
        scenes:data.scenes
    }
}
export const addScenesById = (data)=>{
    return {
        type : ActionType.ADD_SCENES_BY_ID,
        scenes:data.scenes,
        stbId:data.stbId
    }
}
