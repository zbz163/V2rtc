import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
// const actionTypes = TeeVidSdk.actionTypes;

export function* DevicesSaga() {
    yield all([
        takeEvery(Type.SET_CURRENT_MEDIA_DEVICES, setCurrentMediaDevices),
    ])
}

function* setCurrentMediaDevices(data) {
    yield TeeVidSdk.actions.setCurrentMediaDevices(data.devices);
    // yield TeeVidSdk.actions.setMediaDevices(data.devices);
}