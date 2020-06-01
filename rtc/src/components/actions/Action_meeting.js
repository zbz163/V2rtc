import * as ActionType from './ActionType_meeting';

export const sendMessage = (userId, userName, message) => {
    const currTimer = new Date().toUTCString();
    return {
        type : ActionType.SEND_MESSAGE,
        author : {
            id: userId,
            name : userName
        },
        message : message,
        time : currTimer
    }
}

export const disConnected = ()=>{
    const currTimer = new Date().toUTCString();
    return {
        type : ActionType.CONNECTION_DISCONNECT,
        author : {
            id: '1',
            name : "malong"
        },
        message : "disConnected",
        time : currTimer
    }
}

// export const storyboardFetchAll = ()=>{
//     return {
//         type : ActionType.STORYBOARD_FETCH_ALL
//     }
// }

export const showStory = (stbId)=>{
    return {
        type : ActionType.STORYBOARD_FETCH,
        stbId:stbId
    }
}

//change storyBoards slideNumber
export const slideNumberChanged = (number)=>{
    return {
        type : ActionType.MEETING_SLIDE_CHANGED,
        number:number
    }
}

//setMode
export const setMode = (mode,stbId)=>{
    return {
        type : ActionType.MEETING_SET_MODE,
        mode:mode,
        stbId:stbId
    }
}

//muteVideo
export const muteVideo = (state)=>{
    return {
        type : ActionType.MUTE_VIDEO,
        state:state
    }
}

//muteAudio
export const muteAudio = (state)=>{
    return {
        type : ActionType.MUTE_AUDIO,
        state:state
    }
}


export const setCurrentMediaDevices = (devices)=>{
    return {
        type : ActionType.SET_CURRENT_MEDIA_DEVICES,
        devices:devices
    }
}

export const recordingStart = (roomId,path,userId)=>{
    const currTimer = new Date().toUTCString();
    return {
        type : ActionType.START_RECORDING,
        startTime : currTimer,
        room:roomId,
        userId:userId,
        path:path,
    }
}

export const recordingStop = (roomId)=>{
    const currTimer = new Date().toUTCString();
    return {
        type : ActionType.STOP_RECORDING,
        startTime : currTimer,
        room:roomId,
    }
}


export const showBasicLecture = ()=>{
    return {
        type : ActionType.SHOW_BASIC_LECTURE
    }
}

export const logoutBasicLecture = ()=>{
    return {
        type : ActionType.LOGOUT_BASIC_LECTURE
    }
}

export const setLectureLayout = (speakerActiveIndex)=>{
    return {
        type : ActionType.SET_LECTURE_LAYOUT,
        layout:speakerActiveIndex
    }
}
