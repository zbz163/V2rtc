import * as ActionType from './actionType';

export const login = (data) => {
    return {
        type: ActionType.LOGIN,
        name: data.name,
        password: data.password
    }
}


export const logout = () => {
    return {
        type: ActionType.LOGOUT
    }
}

export const connect = (data) => {
    return {
        type: ActionType.CONNECT,
        payload: { username: data.username, room: data.room, pin: data.pin, connectAnyway: data.connectAnyway }
    }
}

export const moderatorRegister = (data)=>{
    return {
        type : ActionType.SET_OWNER_PIN,
        pin:data.pin
    }
}
export const logoutModerator = (data)=>{
    return {
        type : ActionType.LOGOUT_MODERATOR,
        roomId:data.roomId,
        participantId:data.participantId,
        pin:data.pin
    }
}
export const joinMeeting = (data)=>{
    return {
        type : ActionType.JOIN_MEETING,
        meetingInfo:data.meetingInfo
    }
}

export const loginAccount = (data) => {
    return {
        type: ActionType.LOGIN_ACCOUNT,
        accountToken:data.accountToken,
        accountInfo:data.accountInfo
    }
}
export const loginUser = (data) => {
    return {
        type: ActionType.LOGIN_USER,
        accessToken:data.accessToken,
        userInfo:data.userInfo,
        companyName:data.companyName,
        companyLogoUrl:data.companyLogoUrl,
    }
}
export const disConnected = () => {
    return {
        type : ActionType.CONNECTION_DISCONNECT
    }
}



// export const joinMeeting = (data)=>{
//     return {
//         type : ActionType.JOIN_MEETING,
//         meetingInfo:data.meetingInfo
//     }
// }
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
export const stopStreaming = ()=>{
    return {
        type : ActionType.STREAMING_STOP
    }
}
