import { all } from 'redux-saga/effects';
// import { connectSaga } from './connection';
import { LoginSaga } from '../pages/Meeting/Login/connection';
import { MainSaga ,disconnectSaga,disconnectedSaga} from '../pages/Meeting/Main/connection';
import { ChatSaga } from '../pages/Meeting/Chat/connection';
import { ShareScreenSaga } from '../pages/Meeting/ShareScreen/connection';
import { DevicesSaga } from '../pages/Meeting/Slider/connection';
import { ShowStoryBoardsSaga } from '../pages/Meeting/StoryBoards/StoryBoardsBox/connection';
import {OperateStoryBoardsSaga} from '../pages/Meeting/StoryBoards/scenesOperate/connection';

import { CreateStoryBoardsSaga } from '../pages/Meeting/StoryBoards/CreateStoryBoards/connection';
import { StoryBoardsScenesSaga } from '../pages/Meeting/StoryBoards/CreateStoryBoardsScenes/connection';
import { StoryBoardsListSaga } from '../pages/Meeting/StoryBoards/StoryBoardsList/connection';
import {moderatorOperateSaga} from '../pages/Meeting/ParticipantsShow/connection';

//account
import { LoginAccountSaga } from '../pages/Meeting/Login/account/connection';
//user
import {MeetingSaga} from '../pages/User/meetingCharmanPwd/meetingConnection';
import {HeaderUserSaga} from '../pages/User/Header/connection';
import {CompanyInfoSaga} from '../pages/User/LoginNotice/CompanyConnection';

import { omit } from 'rc-mentions/lib/util';


function* rootApiSaga() {
  yield all([
    // connectSaga(),
    LoginSaga(),
    MeetingSaga(),
    MainSaga(),
    disconnectSaga(),
    disconnectedSaga(),

    ChatSaga(),
    ShareScreenSaga(),
    DevicesSaga(),
    ShowStoryBoardsSaga(),

    CreateStoryBoardsSaga(),
    StoryBoardsScenesSaga(),
    OperateStoryBoardsSaga(),
    StoryBoardsListSaga(),
    moderatorOperateSaga(),
    
    LoginAccountSaga(),
    HeaderUserSaga(),
    CompanyInfoSaga(),
  ]);
}
export default rootApiSaga;