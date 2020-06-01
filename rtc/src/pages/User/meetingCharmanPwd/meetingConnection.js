import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
const actionTypes = TeeVidSdk.actionTypes;

export function* MeetingSaga() {
    yield all([
        takeEvery(Type.JOIN_MEETING, joinMeeting),
    ])
}

function* joinMeeting(data){
    yield put({ type: Type.JOIN_MEETING_SUCCESS ,data:{meetingInfo:data.meetingInfo}});
}