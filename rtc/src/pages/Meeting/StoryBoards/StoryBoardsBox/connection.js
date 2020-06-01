import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
// const actionTypes = TeeVidSdk.actionTypes;

export function* ShowStoryBoardsSaga() {
    yield all([
        takeEvery(Type.STORYBOARD_FETCH, showStory),
    ])
}

function* showStory(data) {
    console.log('--------data',data)
    yield TeeVidSdk.actions.storyboardFetch(data.stbId);
    const b = yield TeeVidSdk.actions.setSlideNumber(0);
    // yield put({ type: types.STORYBOARD_CHANGE_SLIDENUMBER, number: 1 });
    yield TeeVidSdk.actions.setMode(data.mode, data.stbId)
    yield put({ type: Type.STORYBOARD_FETCH_BEGIN, data: { isStory: true } });
  }
  