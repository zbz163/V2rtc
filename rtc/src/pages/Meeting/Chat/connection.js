import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
import md5 from 'md5';
const actionTypes = TeeVidSdk.actionTypes;

export function* ChatSaga() {
    yield all([
        takeEvery(Type.SEND_MESSAGE, sendMessage),
        takeEvery(Type.TV_SEND_MESSAGE, function* () { console.log('======TV_SEND_MESSAGE') }),
        takeEvery(Type.TRANSLATOR, translator),


    ])
}
function* sendMessage(data) {
    data.type = Type.TV_SEND_MESSAGE;
    let time = new Date(data.time).getTime();
    let _id = time + data.author.id;
    data._id = md5(_id);
    var res = TeeVidSdk.actions.sendMessage(data);
}
function* translator(data) {
    console.log('=====translator', data)
    var res = yield TeeVidSdk.translator.translate(data.from, data.to, data.text);
    if(res && res.translations){
        yield put({type:Type.TRANSLATOR_RESPONSE,data:{_id:data._id,translations:res.translations}})
    }
    console.log('=====translator res', res)
}
