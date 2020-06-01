import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';

export function* HeaderUserSaga() {
    yield all([
        takeEvery(Type.LOGOUT_USER, logoutUser),
    ])
}
function* logoutUser(){
    // yield TeeVidSdk.actions.logout();
    yield put({type:Type.LOGOUT_SUCCESS});
    yield put({type:Type.LOGOUT_USER_SUCCESS});
}
