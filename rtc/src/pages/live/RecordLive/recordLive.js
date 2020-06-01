import React, { Component } from 'react';
import { Form, message } from 'antd';
import { storageUtils } from '../../../utils';
import axios from 'axios';
import '../player.css';
import PlayerWrap from '../playerWrap';
class RecordLive extends Component {
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
    }
    async componentDidMount() {
        let { config } = this.state;
        config = {
            source: '',
            width: "100%",
            height: "500px",
            isLive: true,
            playsinline: true,
            preload: true,
            showBarTime: 10000,
            controlBarVisibility: "hover",
            useH5Prism: true,
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
        let fileID = this.props.match.params.fileID;
        let anonymousUserID = await storageUtils.GetAnonymousUserID();
        if (anonymousUserID) {
            if (this.state.navigator == 'pc') {
                let data = { anonymousUserID, meetingID, fileID, fileType: 'flv' };
                if (data.anonymousUserID && data.meetingID && data.fileType) {
                    axios.post('/rtc/api/video/startwatch', data)
                        .then(res => {
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
                let data = { anonymousUserID, meetingID, fileID, fileType: 'm3u8' };
                if (data.anonymousUserID && data.meetingID && data.fileType) {
                    axios.post('/rtc/api/video/startwatch', data)
                        .then(res => {
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
            }
        } else {
            await that.createAnonymousUser(that);
            anonymousUserID = await storageUtils.GetAnonymousUserID();
            if (anonymousUserID) {
                if (this.state.navigator == 'pc') {
                    let data = { anonymousUserID, meetingID, fileID, fileType: 'flv' };
                    if (data.anonymousUserID && data.meetingID && data.fileType) {
                        axios.post('/rtc/api/video/startwatch', data)
                            .then(res => {
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
                    let data = { anonymousUserID, meetingID, fileID, fileType: 'm3u8' };
                    if (data.anonymousUserID && data.meetingID && data.fileType) {
                        axios.post('/rtc/api/video/startwatch', data)
                            .then(res => {
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
    componentWillUnmount() {
        let { data } = this.state;
        let logID = data.logID;
        if (logID) {
            axios.post('/rtc/api/video/endwatch', { logID })
                .then(res => {
                }).catch((error) => {
                    message.error(error);
                    return that.props.history.push('/login');
                })
        }
    }
    render() {
        let { config, isPlay } = this.state;
        return (<div>
            <div className="player_box">
                <div>录制文件回放</div>
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


export default RecordLive;