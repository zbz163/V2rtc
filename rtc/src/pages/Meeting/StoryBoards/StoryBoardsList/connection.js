import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
// const actionTypes = TeeVidSdk.actionTypes;

export function* StoryBoardsListSaga() {
    yield all([
        takeEvery(Type.REMOVE_STORY_BOARD, removeStoryBoard),
    ])
}

function* removeStoryBoard(data) {
    console.log('======removeStoryBoard',data)
    yield TeeVidSdk.storyboards.remove(data.stbId);
    yield TeeVidSdk.actions.storyboardFetchAll();
}
