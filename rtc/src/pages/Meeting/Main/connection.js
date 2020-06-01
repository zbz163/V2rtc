import { put, takeEvery, select, all } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import axios from 'axios';
import * as Type from './actionType';
import { storageUtils } from '../../../utils';
const actionTypes = TeeVidSdk.actionTypes;

export function* MainSaga() {
    yield all([
        // takeEvery(Type.CONNECTION_DISCONNECT, disconnect),
        // takeEvery(actionTypes.CONNECTION_DISCONNECTED, disconnected),
        takeEvery(Type.MUTE_VIDEO, muteVideo),
        takeEvery(Type.MUTE_AUDIO, muteAudio),
        takeEvery(Type.START_RECORDING, recordingStart),
        takeEvery(Type.STOP_RECORDING, recordingStop),
        takeEvery(Type.SHOW_BASIC_LECTURE, showBasicLecture),
        takeEvery(Type.LOGOUT_BASIC_LECTURE, logoutBasicLecture),
        takeEvery(Type.SET_LECTURE_LAYOUT, setLectureLayout),
        takeEvery(Type.RAISE_HAND_REQ, raiseHand),
        takeEvery(Type.RAISE_HAND_RES, raiseHandResponse),
        takeEvery(Type.STREAMING_START, startStreaming),
        takeEvery(Type.STREAMING_STOP, stopStreaming),
        takeEvery(actionTypes.SET_STREAMING_STATE, function* (data) {
            console.error('======actionTypes.SET_STREAMING_STATE', data)
        })
    ])
}
export function* disconnectSaga() {
    yield takeEvery(Type.CONNECTION_DISCONNECT, function* () {
        yield put({ type: Type.SAVE_LOGID_OUT });
        yield TeeVidSdk.actions.disconnect();
        yield put({ type: Type.CONNECTION_DisConnect_RESULT });
    });
}

export function* disconnectedSaga() {
    yield takeEvery(actionTypes.CONNECTION_DISCONNECTED, function* () {
        yield put({ type: Type.SAVE_LOGID_OUT });
        yield TeeVidSdk.actions.disconnect();
    });
}

function* disconnect() {
    yield TeeVidSdk.actions.setMode('interactive');
    yield TeeVidSdk.actions.disconnect();
    yield put({ type: Type.LOGOUT_SUCCESS });
    yield put({ type: Type.CONNECTION_DisConnect_RESULT });
}
function* disconnected() {
    yield put(push('/login'));
}
function* muteAudio(data) {
    yield TeeVidSdk.actions.muteAudio(data.state)
}

function* muteVideo(data) {
    yield put(TeeVidSdk.cleanActions.muteVideo(data.state));
    //**********muteVideo 本地有用，远端无用**********
}

function* recordingStop(data) {
    try {
        yield TeeVidSdk.media.stopRecording(data.room);
        let recordingInfo = yield select((state) => state.recording);
        recordingInfo.endTime = data.endTime;
        yield put({ type: Type.RECORDING_END, data: recordingInfo });
    } catch (error) {
        yield put({ type: Type.RECORDING_ERROR, data: error });
    }
}

function* startStreaming() {
    yield TeeVidSdk.actions.startStreaming();
}
function* stopStreaming() {
    yield TeeVidSdk.actions.stopStreaming();
}

function* recordingStart(data) {
    try {
        let recordingInfo = yield TeeVidSdk.media.startRecording(data.room, data.path);
        recordingInfo.startTime = data.startTime;
        recordingInfo.userId = data.userId;
        yield put({ type: Type.RECORDING_BEGIN, data: recordingInfo });
    } catch (error) {
        yield put({ type: Type.RECORDING_ERROR, data: error });
    }
}

function* setLectureLayout(data) {
    yield TeeVidSdk.actions.setLectureLayout(data.layout);
}

function* logoutBasicLecture() {
    yield TeeVidSdk.actions.setMode('interactive');
    yield TeeVidSdk.actions.setLectureLayout(0);
}
function* showBasicLecture(data) {
    yield TeeVidSdk.actions.setLectureLayout(data.layout);
    yield put(TeeVidSdk.cleanActions.setMode('basic-lecture'));
}
function* raiseHand(data) {
    yield TeeVidSdk.actions.raiseHandRequest(data.state);
}
function* raiseHandResponse(data) {
    yield TeeVidSdk.actions.raiseHandResponse(data.accepted, data.targetId);
}
