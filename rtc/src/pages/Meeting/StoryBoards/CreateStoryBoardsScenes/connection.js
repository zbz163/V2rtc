import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
const actionTypes = TeeVidSdk.actionTypes;

export function* StoryBoardsScenesSaga() {
    yield all([
        takeEvery(Type.ADD_SCENES, addScenes),
        takeEvery(Type.ADD_SCENES_BY_ID, addScenesById),
        takeEvery(actionTypes.STORYBOARD_SCENE_CREATE_SUCCESS, function* (result) {
            yield TeeVidSdk.actions.storyboardFetchAll();
        }),
        takeEvery(actionTypes.STORYBOARD_SCENE_CREATE_ERROR, function* (result) { console.error('error=====STORYBOARD_SCENE_CREATE_ERROR', result) }),
        takeEvery(actionTypes.STORYBOARD_SUCCESS_ALL, function* (result) {
            // console.log('success=====STORYBOARD_SUCCESS_ALL', result)
        }),
        takeEvery(actionTypes.STORYBOARD_ERROR, function* (result) { console.error('error=====STORYBOARD_ERROR', result) }),
    ])
}
function* addScenes(data) {
    let storyBoards = yield select((state) => state.createStoryBoards);
    if (storyBoards && storyBoards.id) {
        yield TeeVidSdk.actions.storyboardSceneCreate(storyBoards._id, data.scenes);
        yield put({ type: Type.SAVE_STORY_BOARDS_SUCCESS, data: storyBoards });
    } else {
        let author = yield select((state) => state.teevid.user.profile.name);
        let data1 = { author, owner: author, bgImage: "", isImported: false, logo: "", notes: "", scenes: [], styles: [], title: '测试2', theme: "blue", watermark: "", thumbnail: "http://b-ssl.duitang.com/uploads/item/201208/30/20120830173930_PBfJE.jpeg" }
        let newstoryBoards = yield TeeVidSdk.storyboards.create(data1);
        yield TeeVidSdk.actions.storyboardSceneCreate(newstoryBoards._id, data.scenes);
        yield put({ type: Type.SAVE_STORY_BOARDS_SUCCESS, data: newstoryBoards });

    }
}
function* addScenesById(data) {
    yield TeeVidSdk.actions.storyboardSceneCreate(data.stbId, data.scenes);
    let storyBoards = yield TeeVidSdk.actions.storyboardFetch(data.stbId);
    yield put({ type: Type.SAVE_STORY_BOARDS_SUCCESS, data: storyBoards });
}
