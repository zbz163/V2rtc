import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
const actionTypes = TeeVidSdk.actionTypes;

export function* LoginAccountSaga() {
    yield all([
        takeEvery(Type.LOGIN_ACCOUNT, login),
        takeEvery(Type.LOGIN_USER,loginUser),
    ])
}
function* login(data){
    yield put({type:Type.LOGIN_ACCOUNT_SUCCESS,data:data});
}
function* loginUser(data){
    yield put({type:Type.LOGIN_USER_SUCCESS,data:data});
}
