import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
// import * as OtherType from '../StoryBoardsBox/reducers';

export function* CreateStoryBoardsSaga() {
    yield all([
        takeEvery(Type.UPLOAD_IMG, uploadImg),
        takeEvery(Type.SAVE_STORY_BOARDS, saveStoryBoards),
        takeEvery(Type.STORYBOARD_FETCH, storyboardFetch),
        takeEvery(Type.INIT_CREATE_STB, initCreateStb),
        takeEvery(Type.UPDATE_STB, updateStb),

        
    ])
}
function* uploadImg(data) {
    console.log('====uploadImg', data)
    var url = yield TeeVidSdk.storyboards.uploadImage(data.file);
    console.log('====url res', url);
}
function* saveStoryBoards(data) {
    console.log('====saveStoryBoards', data)
    const author = yield select((state) => state.teevid.user.profile.name);
    let data1 = { author, owner: author, bgImage: "", isImported: false, logo: "", notes: "", scenes: [], styles: [], title: '测试1', theme: "blue", watermark: "", thumbnail: "http://b-ssl.duitang.com/uploads/item/201208/30/20120830173930_PBfJE.jpeg" }
    let newStoryBoards = yield TeeVidSdk.storyboards.create(data1);
    yield put({ type: Type.SAVE_STORY_BOARDS_SUCCESS, data: newStoryBoards });
    console.log('====saveStoryBoards res', newStoryBoards);
}
function* storyboardFetch(data) {
    yield TeeVidSdk.actions.storyboardFetch(data.stbId);
}
function* initCreateStb() {
    yield  put({ type: Type.INIT_CREATE_STB_SUCCESS, data: {} });
}
function* updateStb(data) {
    yield TeeVidSdk.storyboards.edit(data.stbId,data.data);
    yield TeeVidSdk.actions.storyboardFetch(data.stbId);
}
