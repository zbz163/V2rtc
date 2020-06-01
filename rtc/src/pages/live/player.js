import React, { Component } from 'react';
// import ReactDOM from 'react-dom';
import { Form, message } from 'antd';
// import Player from 'aliplayer-react';
import { storageUtils } from '../../utils';
import axios from 'axios';
import moment from 'moment';
import './player.css';
import PlayerWrap from './playerWrap';
class LivePlayer extends Component {

  constructor(props, context) {
    super(props, context);
    this.changeLine = this.changeLine.bind(this);
  }

  state = {
    instance: null,  // player instance, e.g: player.stop();
    end: '',
    living: '',
    notStar: '',
    data: {},
    item: '1',
    navigator: '',
    isPlay: false,
    config: {},
    isChangeLine: false,
    liveInfo: {},
  }

  async componentDidMount() {
    let { config } = this.state;
    config = {
      source: '',
      // components: [
      //   {
      //     name: "RateComponent",
      //     type: Player.components.RateComponent,
      //   }
      // ]
    }
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
      this.setState({
        navigator: 'move'
      })
      console.log('手机端')
    } else {
      this.setState({
        navigator: 'pc'
      })
      console.log('PC端')
    }
    let that = this;
    let meetingID = this.props.match.params.meetingID;
    let anonymousUserID = await storageUtils.GetAnonymousUserID();
    if (anonymousUserID) {
      if (this.state.navigator == 'pc') {
        console.log('============navigator', this.state.navigator)
        let data = { anonymousUserID, meetingID, fileType: 'flv' };
        console.log('========data pc', data)
        if (data.anonymousUserID && data.meetingID && data.fileType) {
          axios.post('/rtc/api/live/startwatch', data)
            .then(res => {
              console.log('======res', res);
              if (res.status === "ERROR") {
                return message.warning(res.error.message);
              } else if (res.status === "OK") {
                let liveInfo = res.result;
                config['source'] = res.result.url;
                // console.log('======config', config);
                console.log('================config', config)
                that.setState({ data: res.result, config, isPlay: true });
              }

            }).catch((error) => {
              message.error(error);
              return that.props.history.push('/login');
            })
        }
      } else if (this.state.navigator == 'move') {
        console.log('============navigator', this.state.navigator)
        let data = { anonymousUserID, meetingID, fileType: 'm3u8' };
        console.log('========data move', data)

        if (data.anonymousUserID && data.meetingID && data.fileType) {
          axios.post('/rtc/api/live/startwatch', data)
            .then(res => {
              console.log('======res', res);
              if (res.status === "ERROR") {
                return message.warning(res.error.message);
              } else if (res.status === "OK") {
                let liveInfo = res.result;
                config['source'] = res.result.url;
                console.log('======config', config);
                that.setState({ data: res.result, config, isPlay: true });
              }

            }).catch((error) => {
              message.error(error);
              return that.props.history.push('/login');
            })
        }
      }
    } else {
      await that.createAnonymousUser(that);
      anonymousUserID = await storageUtils.GetAnonymousUserID();
      if (anonymousUserID) {
        if (this.state.navigator == 'pc') {
          console.log('============navigator222 pc', this.state.navigator)
          let data = { anonymousUserID, meetingID, fileType: 'flv' };
          if (data.anonymousUserID && data.meetingID && data.fileType) {
            console.log('===data pc', data)
            axios.post('/rtc/api/live/startwatch', data)
              .then(res => {
                console.log('======res ------no', res);
                if (res.status === "ERROR") {
                  return message.warning(res.error.message);
                } else if (res.status === "OK") {
                  let liveInfo = res.result;
                  config['source'] = res.result.url;
                  that.setState({ data: res.result, config, isPlay: true });
                }
              }).catch((error) => {
                message.error(error);
                return that.props.history.push('/login');
              })
          }
        } else if (this.state.navigator == 'move') {
          console.log('============navigator222 move', this.state.navigator)
          let data = { anonymousUserID, meetingID, fileType: 'm3u8' };
          if (data.anonymousUserID && data.meetingID && data.fileType) {
            console.log('===data move', data)
            axios.post('/rtc/api/live/startwatch', data)
              .then(res => {
                console.log('======res ------no', res);
                if (res.status === "ERROR") {
                  return message.warning(res.error.message);
                } else if (res.status === "OK") {
                  let liveInfo = res.result;
                  config['source'] = res.result.url;
                  that.setState({ data: res.result, config, isPlay: true });
                }
              }).catch((error) => {
                message.error(error);
                return that.props.history.push('/login');
              })
          }
        };
      }
    }
    that.getLiveInfo(meetingID, that);
    let interval = setInterval(() => {//计时器
      let liveData = that.state.data;
      if (liveData.state === "end") {
        return clearInterval(interval);
      }
      // if (liveData.state === "notStar") {
      (async () => {
        let anonymousUserIDNew = await storageUtils.GetAnonymousUserID();
        await that.getLiveInfo(meetingID, that);
        let getliveInfo = that.state.liveInfo;
        if (this.state.navigator == 'pc') {
          if (anonymousUserIDNew) {
            let data = { anonymousUserID: anonymousUserIDNew, meetingID, fileType: 'flv' };
            axios.post('/rtc/api/live/startwatch', data)
              .then(res => {
                console.log('======res ------no', res);
                if (res.status === "ERROR") {
                  return message.warning(res.error.message);
                } else if (res.status === "OK") {
                  // if(liveData.url === res.result.url)
                  if(!liveData.url){
                    config['source'] = res.result.url;
                  }
                  that.setState({ data: res.result, config, isPlay: true });
                }
              }).catch((error) => {
                message.error(error);
                return that.props.history.push('/login');
              })
          } else if (this.state.navigator == 'move') {
            let data = { anonymousUserID: anonymousUserIDNew, meetingID, fileType: 'm3u8' };
            axios.post('/rtc/api/live/startwatch', data)
              .then(res => {
                console.log('======res ------no', res);
                if (res.status === "ERROR") {
                  return message.warning(res.error.message);
                } else if (res.status === "OK") {
                  if(!liveData.url){
                    config['source'] = res.result.url;
                  }
                  that.setState({ data: res.result, config, isPlay: true });
                }
              }).catch((error) => {
                message.error(error);
                return that.props.history.push('/login');
              })
          }
        }
      })()
      // } else {
      //   clearInterval(interval);
      // }
    }, 60000)
  }
  createAnonymousUser(that) {
    new Promise(resolve => {
      axios.post("/rtc/api/user/anonymous").then((res) => {
        if (res.status === "ERROR") {
          return that.props.history.push('/login');
        } else if (res.status === "OK") {
          (async () => {
            await storageUtils.SetAnonymousUserID(res.result.anonymousUserID);
            resolve();
          })()
        }
      })
    })
  }
  getLiveInfo(meetingID, that) {
    let liveInfo = {};
    //liveInfo
    //state:0//开始推流（准备开启直播）；1.直播正在进行；2.结束推流进行中（直播结束）;3.直播已结束；4直播未开始
    axios.get('/rtc/api/live', { params: { mid: meetingID } }).then((res) => {
      console.log('=======live res', res)
      if (res.status === "ERROR") {
        return;
      } else if (res.status === "OK") {
        if (!res.result.liveInfo) {
          // storageUtils.SetLiveID("");
          liveInfo = { state: 4, liveID:"" };
          that.setState({ liveInfo });
        } else {
          let liveInfoData = res.result.liveInfo;
          // that.setState({ liveInfo: res.result.liveInfo })
          if (liveInfoData && liveInfoData.liveID) {
            let num = liveInfoData.actionRecords.length - 1;
            if (liveInfoData.actionRecords[num].actionType == 0) {
              // that.props.stopStreaming();
              liveInfo = { state: 0, liveID: res.result.liveInfo.liveID };
              that.setState({ liveInfo });
            } else if (liveInfoData.actionRecords[num].actionType == 1) {
              liveInfo = { state: 1, liveID: res.result.liveInfo.liveID };
              that.setState({ liveInfo });
            } else if (liveInfoData.actionRecords[num].actionType == 2) {
              let num1 = num - 1;
              if (liveInfoData.actionRecords[num1].actionType == 1) {
                liveInfo = { state: 3, liveID: res.result.liveInfo.liveID };
                that.setState({ liveInfo });
              } else if (liveInfoData.actionRecords[num1].actionType == 0) {
                liveInfo = { state: 3, liveID: res.result.liveInfo.liveID };
                that.setState({ liveInfo });
              }
            } else if (liveInfoData.actionRecords[num].actionType == 3) {
              liveInfo = { state: 3, liveID: res.result.liveInfo.liveID };
              that.setState({ liveInfo });
            }
          }
        }
      }
    })
  }
  changeLine() {

    let { config } = this.state;

    let that = this;
    let meetingID = this.props.match.params.meetingID;
    (async () => {
      let anonymousUserID = await storageUtils.GetAnonymousUserID();
      if (anonymousUserID) {
        let data = { anonymousUserID, meetingID, fileType: 'm3u8' };
        axios.post('/rtc/api/live/startwatch', data)
          .then(res => {
            if (res.status === "ERROR") {
              return message.warning(res.error.message);
            } else if (res.status === "OK") {
              config['source'] = res.result.url;
              that.setState({ data: res.result, config, isPlay: true, isChangeLine: true });
            }
          }).catch((error) => {
            message.error(error);
            return that.props.history.push('/login');
          })
      }
    })()
  }
  componentWillUnmount() {
    let { data } = this.state;
    let logID = data.logID;
    if (logID) {
      axios.post('/rtc/api/live/stopWatchLiveApi', { logID })
        .then(res => {
        }).catch((error) => {
          message.error(error);
          return that.props.history.push('/login');
        })
    }
  }
  render() {
    console.log(this.state.end, this.state.living, this.state.notStar)
    let { data, config, isPlay, isChangeLine ,liveInfo} = this.state;
    console.log('====liveInfo',liveInfo);
    let bgTime;
    let endTime;
    var end = document.getElementById('end');
    var living = document.getElementById('living');
    var notStar = document.getElementById('notStar');
    var preStart = document.getElementById('preStart');
    var error = document.getElementById('error');
    if (data.state == "end") {
      end.style.display = 'block';
      let endTimes = data.endTime;
      let startTimes = new Date(endTimes).getTime();
      endTime = moment(startTimes).format("HH:mm");
    } else if (data.state == "living") {
      living.style.display = 'block';
    } else if (data.state == "notStar") {
      notStar.style.display = 'block';
      let beginTime = data.beginTime;
      let startTimes = new Date(beginTime).getTime();
      bgTime = moment(startTimes).format("HH:mm");
    } else if (data.state == "preStart") {
      preStart.style.display = 'block';
    } else if (data.state == "error") {
      error.style.display = 'block';
    }

    // {isPlay && data.state === "living" &&
    //       // <Player
    //       //   config={config}
    //       //   onGetInstance={instance => this.setState({ instance })}
    //       // />
    //       <PlayerWrap config={config} />
    //     }
    return (<div>
      <div className="player_box">
        <div style={{ display: 'none' }} id="end">直播已结束 结束时间：{endTime}</div>
        <div style={{ display: 'none' }} id="living">正在直播：{data.topic}</div>
        <div style={{ display: 'none' }} id="notStar">直播尚未开始 预计开始时间：{bgTime}</div>
        <div style={{ display: 'none' }} id="preStart">直播异常，请稍后再试</div>
        <div style={{ display: 'none' }} id="error">直播异常，请稍后再试</div>
        <div className={"changeLine " + (isChangeLine ? "active" : "")} onClick={this.changeLine} >
          <span>切换线路</span>
        </div>
      </div>
      <div>
        {isPlay &&
          <PlayerWrap config={config} />
        }
      </div>
      <div className="player_footer"></div>
    </div>);
  }
}


export default LivePlayer;