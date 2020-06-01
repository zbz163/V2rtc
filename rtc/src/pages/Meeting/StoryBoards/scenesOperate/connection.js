import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
export function* OperateStoryBoardsSaga() {
    yield all([
        takeEvery(Type.MEETING_SLIDE_CHANGED, slideNumberChanged),
        takeEvery(Type.MEETING_SET_MODE, setMode),

    ])
}
function* slideNumberChanged(data) {
    if (data.type === Type.MEETING_SLIDE_CHANGED) {
        TeeVidSdk.actions.setSlideNumber(data.number);
    }
}
function* setMode(data) {
    const a =  yield TeeVidSdk.actions.setMode(data.mode, data.stbId);
    yield TeeVidSdk.actions.setSlideNumber(0);
    yield put({ type: Type.STORYBOARD_FETCH_END, data: { isStory: false } });
}