import { createBrowserHistory as createHistory } from 'history';
import { routerMiddleware, routerReducer } from 'react-router-redux';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';
import saga from '../saga/index';

// ********** meeting begin ***********//

import sendChat from '../pages/Meeting/Chat/reducers';
import translations from '../pages/Meeting/Chat/translationReducers';
import loginState from '../pages/Meeting/Login/reducers';
import meetingInfo from '../pages/User/meetingCharmanPwd/meetingReducers';
import conNect from '../pages/Meeting/Login/connectReducers';
import reCording from '../pages/Meeting/Main/reducers';
import storyReducer from '../pages/Meeting/StoryBoards/StoryBoardsBox/reducers';
import moderator from '../pages/Meeting/Login/moderatorReducers';
import createStoryBoards from '../pages/Meeting/StoryBoards/CreateStoryBoards/reducers';

//********* meeting end ***********//

//********* account begin ***********//
import account from '../pages/Meeting/Login/account/reducers'; 
import companyInfo from '../pages/User/LoginNotice/companyReducers';
import logID from '../pages/User/LoginNotice/logoIdReducers';
//******** account end ********//


export const history = createHistory();
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const sagaMw = createSagaMiddleware({
  onError: (error) => {
    console.error('@ createSagaMiddleware error: ', error);
  }
});

const routerMw  = routerMiddleware(history);
const currTimer = new Date().toUTCString();

const initialState = {
  v2Message:[],
  translations:[],
  loginState:'0',
//   v2screenShare:[],
//   slideNumber:0,
  isStory:false,
  recording:{},
  moderator:'0',
  createStoryBoards:{},
  account:{
    accountToken:"",
    accountInfo:{},
    user:{}
  },
  meetingInfo:{},
  companyInfo:{},
  logID:"",
}

export const store = createStore(
  combineReducers({
    // form          : formReducer,
    router        : routerReducer,
    teevid        : TeeVidSdk.reducer,
    v2Message     : sendChat,
    translations,
    // v2screenShare : screenShareReducer,
    loginState,
    isStory: storyReducer,
    conNect,
    recording:reCording,
    // slideNumber,
    moderator,
    createStoryBoards,
    account:account,
    meetingInfo,
    companyInfo,
    logID,
  }), initialState, composeEnhancers(applyMiddleware(sagaMw, routerMw)));

sagaMw.run(saga);
sagaMw.run(TeeVidSdk.saga);
TeeVidSdk.init('rtc.ivage.com:30443', store, '806a1e29-1d69-4da4-9344-4e5cc7c35f83');