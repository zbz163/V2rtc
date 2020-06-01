import * as ActionType from './actionType';

export const setCurrentMediaDevices = (data)=>{
    return {
        type : ActionType.SET_CURRENT_MEDIA_DEVICES,
        devices:data
    }
}