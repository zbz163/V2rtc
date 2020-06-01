import { put, takeEvery, select, all } from 'redux-saga/effects';
import { push } from 'react-router-redux';

import * as Type from './actionType';
const actionTypes = TeeVidSdk.actionTypes;

export function* moderatorOperateSaga() {
    yield all([
        takeEvery(Type.KICK_PARTICIPANT, kickParticipant),
        takeEvery(Type.REMOTE_MUTE, remoteMute),
        takeEvery(Type.RAISE_HAND_RES, raiseHandResponse),
    ])
}
function* kickParticipant(data) {
    yield TeeVidSdk.actions.kickParticipant(data.roomId, data.participantId);
}
function* remoteMute(data) {
    console.log('===========data remoteMute', data);
    if (data.state === true) {
        const a = yield TeeVidSdk.actions.remoteMute(data.participantId, data.device, data.state);
        let participant = yield select((state) => state.teevid.meeting.remoteParticipants[data.participantId]);
        console.log('==================participant', participant)
        if (participant && participant._id) {
            let mute = participant.status.mute;
            mute[data.device].byModerator = data.state;
            yield TeeVidSdk.actions.participantMuteUpdate(data.participantId, mute);
            console.log('====================')
        }
    }
}
function* raiseHandResponse(data) {
    console.error('raiseHandResponse', data)
    const a = yield TeeVidSdk.actions.raiseHandResponse(data.accepted, data.targetId);
    console.error('raiseHandResponse', a)

}