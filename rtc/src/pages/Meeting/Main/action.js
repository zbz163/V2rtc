import * as ActionType from './actionType';

export const disConnected = () => {
    return {
        type : ActionType.CONNECTION_DISCONNECT
    }
}
//muteVideo
export const muteVideo = (data)=>{
    return {
        type : ActionType.MUTE_VIDEO,
        state:data.state
    }
}

//muteAudio
export const muteAudio = (data)=>{
    return {
        type : ActionType.MUTE_AUDIO,
        state:data.state
    }
}

export const recordingStart = (data)=>{
    const currTimer = new Date().getTime();
    return {
        type : ActionType.START_RECORDING,
        startTime : currTimer,
        room:data.roomId,
        userId:data.userId,
        path:'/tmp/kurento/recordings/',
    }
}

export const recordingStop = (data)=>{
    const currTimer = new Date().getTime();
    return {
        type : ActionType.STOP_RECORDING,
        endTime : currTimer,
        room:data.roomId,
    }
}

export const showBasicLecture = (data)=>{
    return {
        type : ActionType.SHOW_BASIC_LECTURE,
        layout:data.speakerActiveIndex
    }
}

export const logoutBasicLecture = ()=>{
    return {
        type : ActionType.LOGOUT_BASIC_LECTURE
    }
}

export const setLectureLayout = (data)=>{
    return {
        type : ActionType.SET_LECTURE_LAYOUT,
        layout:data.speakerActiveIndex
    }
}
export const raiseHand = (data)=>{
    return {
        type : ActionType.RAISE_HAND_REQ,
        state:data.state
    }
}
export const raiseHandResponse = (data)=>{
    return {
        type : ActionType.RAISE_HAND_RES,
        accepted:data.accepted,
        targetId:data.targetId
    }
}
export const startStreaming = ()=>{
    return {
        type : ActionType.STREAMING_START
    }
}
export const stopStreaming = ()=>{
    return {
        type : ActionType.STREAMING_STOP
    }
}
export const moderatorRegister = (data)=>{
    return {
        type : ActionType.SET_OWNER_PIN,
        pin:data.pin
    }
}