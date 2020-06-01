import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
const actionTypes = TeeVidSdk.actionTypes;
import { publishStream, initLocalStream } from '../Login/connection';

export function* ShareScreenSaga() {
    yield all([
        takeEvery(Type.SCREEN_SHARE_START, startShare),
        takeEvery(Type.CONNECTION_STOP_SHARING, stopShare),
    ])
}
// function* sendMessage(data) {
//     data.type = Type.TV_SEND_MESSAGE;
//     var res = TeeVidSdk.actions.sendMessage(data);
// }
function* startShare(data) {
    const getDisplay = (opts, cb, error) => navigator.mediaDevices.getDisplayMedia().then(cb).catch(error);

    const getBrowser = () => 'chrome-stable';
    const stream = TeeVidSdk.Stream({
        video: true,
        screen: true
    }, { GetUserMedia: getDisplay, getBrowser });

    // const connection = select((state) => state.teevid.meeting.connection);
    var callback_public = (id, error) => {
        if (error) {
            console.error('Publish error - ' + error);
        }
    }

    initLocalStream(stream).then((newStream) => {
        publishStream(newStream, null, callback_public).then((test) => { })
    })
}
function* stopShare(data) {
    if (!data.screenStreamId) {
        return console.error('..messageMw...............end share, but action.screenStreamId = null');
    } else {
        yield TeeVidSdk.actions.setSharingStream(null);
        const streamsList = yield yield select((state) => state.teevid.meeting.streams);
        if (!streamsList[data.screenStreamId]) {
            return console.error('..messageMw...............end share, but action.screenStreamId = undifined');
        }else{
            console.log('=================streamsList[action.screenStreamId]', streamsList[data.screenStreamId])
            let stream = streamsList[data.screenStreamId];
            stream.close();
            TeeVidSdk.actions.streamRemoved(stream);
        }
        
    }
}
