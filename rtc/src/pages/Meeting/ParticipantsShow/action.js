import * as ActionType from './actionType';
export const kickParticipant = (data)=>{
    return {
        type : ActionType.KICK_PARTICIPANT,
        participantId:data.participantId,
        roomId:data.roomId
    }
}
export const remoteMute = (data)=>{
    return {
        type : ActionType.REMOTE_MUTE,
        participantId:data.participantId,
        device:data.device,
        state:data.state
    }
}
export const remoteMuteOver = (data)=>{
    return {
        type : ActionType.RAISE_HAND_RES,
        accepted:data.accepted,
        targetId:data.targetId
    }
}