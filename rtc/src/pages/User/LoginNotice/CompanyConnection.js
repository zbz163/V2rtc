import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
// import { saveCompany } from './action';
const actionTypes = TeeVidSdk.actionTypes;

export function* CompanyInfoSaga() {
    yield all([
        takeEvery(Type.SAVE_COMPANY, saveCompany),
        takeEvery(Type.SAVE_LOGID, saveLogId),
        
    ])
}

function* saveCompany(data){
    console.error('=======data saveCompany',data)
    yield put({ type: Type.SAVE_COMPANY_SUCCESS ,data:{CompanyInfo:data.CompanyInfo}});
}
function* saveLogId(data){
    console.error('=======data saveLogId',data)
    yield put({ type: Type.SAVE_LOGID_SUCCESS ,data:{logID:data.logID}});
}