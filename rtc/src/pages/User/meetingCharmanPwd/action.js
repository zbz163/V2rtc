import * as ActionType from './actionType';
export const connect = (data) => {
    return {
        type: ActionType.CONNECT,
        payload: { username: data.username, room: data.room, pin: data.pin, connectAnyway: data.connectAnyway }
    }
}
export const joinMeeting = (data)=>{
    return {
        type : ActionType.JOIN_MEETING,
        meetingInfo:data.meetingInfo
    }
}
export const saveCompany = (data)=>{
    return {
        type : ActionType.SAVE_COMPANY,
        CompanyInfo:data.CompanyInfo
    }
}
export const saveLogID = (data)=>{
    return {
        type : ActionType.SAVE_LOGID,
        logID:data.logID
    }
}