import React, { Component } from 'react';
import { Provider } from 'react-redux';
import './sdk/sdk.js';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import Login from './pages/Meeting/Login/Login.js';
import './ant.css';
import Main from './pages/Meeting/Main/Main.js';
import Scene from './pages/Meeting/Scene/scene.js';
import StoryBoardsList from './pages/Meeting/StoryBoards/StoryBoardsList/StoryBoardsList';
import CreateStoryBoards from './pages/Meeting/StoryBoards/CreateStoryBoards/createStoryBoards';
import CreateStoryBoardsSences from './pages/Meeting/StoryBoards/CreateStoryBoardsScenes/CreateSences';
import Invitelink from './pages/Meeting/Invitelink/Invitelink';

import RouterCustom from './pages/Company/routes/index';
import Register from './pages/Meeting/Register/register';
import CompanyUser from './pages/User/Personal/homepage';

//user
import MeetingsList from './pages/User/MeetingsList/MeetingsList';
import LiveRecordList from './pages/User/LiveRecordList/LiveRecordList';



import Player from './pages/live/player';
import RecordLive from './pages/live/RecordLive/recordLive';

import { history, store } from './reducers/reduxRoot';
// import {} from './redux/store/store'
// import { PersistGate } from 'redux-persist/lib/integration/react';

class App extends Component {
  render() {
    return (
      <Provider store={store}>
          <div className="App">
            <Router history={history}>
              <Switch>
                <Route exact path="/" component={Login} />
                <Route exact path='/meeting' component={Main} />
                <Route exact path='/storyBoardsList' component={StoryBoardsList} />
                <Route exact path='/createNewStoryBoards' component={CreateStoryBoards} />
                <Route exact path='/createStoryBoardsSences' component={CreateStoryBoardsSences} />
                <Route exact path='/createStoryBoardsSences/:stbId' component={CreateStoryBoardsSences} />
                <Route exact path='/createNewStoryBoards/:stbId' component={CreateStoryBoards} />
                <Route exact path='/invite/:meetingID' component={Invitelink} />
                <Route exact path='/company/register' component={Register} />
                <Route exact path="/login" component={Login} />

                <Route exact path='/company/profile' component={RouterCustom} />
                <Route exact path='/company/recharge' component={RouterCustom} />
                <Route exact path='/company/orders' component={RouterCustom} />
                <Route exact path='/company/dosages' component={RouterCustom} />
                <Route exact path='/company/users' component={RouterCustom} />
                <Route exact path='/company/meetings' component={RouterCustom} />
                <Route exact path='/company/rooms' component={RouterCustom} />
                <Route exact path='/company/framework' component={RouterCustom} />
                <Route exact path='/company/meetingLog' component={RouterCustom} />

                
                <Route exact path='/company/exit' component={RouterCustom} />
                
                {/* user */}
                <Route exact path='/user/info' component={CompanyUser} />
                <Route exact path='/user/meetingsList' component={MeetingsList} />

                <Route exact path='/live/:meetingID' component={Player} />
                <Route exact path='/liveRecord/:meetingID/:fileID' component={RecordLive} />
                <Route exact path='/liveRecordList/:meetingID' component={LiveRecordList} />
                
                <Route exact path='/player' component={Player} />

                
              </Switch>
            </Router>
          </div>
      </Provider>
    )
  }
}
export default App;