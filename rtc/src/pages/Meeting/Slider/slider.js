import React, { Component } from 'react'
import { Form, Select, message } from 'antd'
import { connect } from 'react-redux';
import * as actions from './action.js';
import _ from 'underscore';
import './slider.css';
const { Option } = Select;
class Sliders extends Component {
    constructor(props, context) {
        super(props, context);
        this.changeMedia = this.changeMedia.bind(this);
        this.changeVideo = this.changeVideo.bind(this);
        this.changeAudio = this.changeAudio.bind(this);
        this.state = {
            changeVideo: '',
            changeAudio: '',
            ChildrenMsg:true
        }
    }
    changeVideo(event) {
        this.setState({ changeVideo: event }) // event.target.value === deviceId
    }
    changeAudio(event) {
        this.setState({ changeAudio: event })
    }
    changeMedia() {
        let video = this.state.changeVideo;
        let audio = this.state.changeAudio;
        let { currentDevices } = this.props;
        if (!video) {
            if (currentDevices && currentDevices.video) {
                video = currentDevices.video.deviceId;
                this.setState({ changeVideo: video });
            }
        }
        if (!audio) {
            if (currentDevices && currentDevices.audio) {
                audio = currentDevices.audio.deviceId;
                this.setState({ changeAudio: audio });
            }
        }
        let { videoList, audioList } = this.props;
        let videoInfo = _.first(_.where(videoList, { deviceId: video })) || null;
        let audioInfo = _.first(_.where(audioList, { deviceId: audio })) || null;
        if (!videoInfo) {
            return message.error('请选择摄像头');
        }
        if (!audioInfo) {
            return message.error('请选择麦克风');
        }
        var data = { audio: audioInfo, video: videoInfo }
        this.props.changeMedia(data);
        //缺，隐藏模态框
        document.getElementById("slider_click").style.display = "none";
    }
    toParent = () => {
        this.props.parent.getChildrenMsg(this.state.ChildrenMsg)
    }
    render() {
        let { videoList, audioList, currentDevices } = this.props;
        let { changeVideo, changeAudio } = this.state;
        return (
            <div className="slider_content">
                <span>媒体设备配置</span>
                <form className="layui-form" action="" style={{ padding: "24px" }}>
                    <div className="layui-form-text">
                        <label className="layui-form-label">选择摄像头</label>
                        <Select style={{ width: '100%', paddingTop: '6px' }}  onDropdownVisibleChange={this.toParent.bind(this)} onChange={this.changeVideo} value={changeVideo ? changeVideo : (currentDevices ? (currentDevices.video ? currentDevices.video.deviceId : '') : '')}>
                            <Option value="">请选择摄像头</Option>
                            {
                                Object.entries(videoList).map(item => {
                                    const device = item[1];
                                    return (<Option value={device.deviceId} key={device.deviceId}>{device.label}</Option>)
                                })
                            }
                        </Select>
                    </div>

                    <div className="layui-form-text">
                        <label className="layui-form-label">选择麦克风</label>
                        <Select style={{ width: '100%', paddingTop: '6px' }} onDropdownVisibleChange={this.toParent.bind(this)} onChange={this.changeAudio} value={changeAudio ? changeAudio : (currentDevices ? (currentDevices.audio ? currentDevices.audio.deviceId : '') : '')}>
                            <Option value="">请选择麦克风</Option>

                            {
                                Object.entries(audioList).map(item => {
                                    const device = item[1];
                                    return (<Option value={device.deviceId} key={device.deviceId}>{device.label}</Option>)
                                })
                            }
                        </Select>
                    </div>
                    <div className="slider_bth" onClick={this.changeMedia}>应用</div>
                </form>
            </div>

        )
    }
}

const mapStateToProps = (state) => {
    return {
        audioList: state.teevid.api.audioDevices,//摄像头列表
        videoList: state.teevid.api.videoDevices,//麦克风列表
        currentDevices: state.teevid.api.currentDevices,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        changeMedia: (data) => {
            var action = actions.setCurrentMediaDevices(data);
            dispatch(action);
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Sliders));