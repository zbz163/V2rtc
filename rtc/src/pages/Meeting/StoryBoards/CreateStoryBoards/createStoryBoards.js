import React, { Component } from 'react'
import { Form, Select, Icon, Button, Radio, Switch, Slider, Upload, message, Input } from 'antd'
import axios from 'axios';
import qs from 'qs'
import { connect } from 'react-redux';
import * as actions from './action.js';
import { Link } from "react-router-dom";


import ScenesItem from './scenesBox/scenesItem';
import './createStoryBoards.css';
function getBase64(img, callback) {
    console.log('========base64', img, callback)
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function convertBase64UrlToBlob(urlData) {

    var bytes = window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte

    //处理异常,将ascii码小于0的转换为大于0
    var ab = new ArrayBuffer(bytes.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < bytes.length; i++) {
        ia[i] = bytes.charCodeAt(i);
    }

    return new Blob([ab], { type: 'image/png' });
}

function beforeUpload(file) {
    console.log('-------upload image', file)
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
        message.error('You can only upload JPG/PNG file!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
    }
    return isJpgOrPng && isLt2M;
}

class CreateStoryBoards extends Component {

    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
        this.createScenes = this.createScenes.bind(this);
        this.saveStoryBoards = this.saveStoryBoards.bind(this);
        this.state = {
            image: false,
            trademark: false,
            watermark: false,
            loading: false,
            imageUrlBg: "",
            stb: {},
        };

    }

    componentWillMount() {
        if (this.props.match.params.stbId) {
            let { user } = this.props;
            if (!user.profile) {
                message.error('请先登录');
                return this.props.history.push('/storyBoardsList');
            }
            let stbId = this.props.match.params.stbId;
            this.props.storyboardFetch({ stbId });
        } else {
            this.props.initCreateStb();
        }
    }
    componentWillReceiveProps() {
            let { storyboard } = this.props;
            if(storyboard){
                this.setState({ stb: storyboard });
            }
    }

    handleChange = info => {
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, imageUrl =>
                this.setState({
                    imageUrl,
                    loading: false,
                })
            );
        }
        // let { token } = this.props;

        // axios.defaults.headers.common["token"] = token;
        // this.$axios.post('rtcTee/api/v1/upload/image', { headers: { 'accept': 'application/json', "Content-Type": "multipart/form-data", token:`${token}`} })
        //     .then(res => {
        //         console.log('=====getAccessTokens res', res)
        //     }).catch(error => {
        //         console.log('=========getAccessTokens error', error)
        //     })
    };
    handleChange1 = info => {
        var that = this;
        let { token } = this.props;
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            getBase64(info.file.originFileObj, (imageUrl) => {
                console.log('====imageUrl', imageUrl);
                if (imageUrl) {
                    let file = convertBase64UrlToBlob(imageUrl);
                    this.props.uploadImg({ file });
                }
            })
        }

        axios.defaults.headers.common["Authorization"] = token;
        axios.defaults.headers.common["Content-Type"] = "multipart/form-data";


        axios.post('https://rtc.ivage.com:30443/api/v1/upload/image', { file: info.file.name, type: info.file.type },
            { headers: { 'Content-Type': 'multipart/form-data' } })
            .then(res => {
                console.log('=====upload/image', res)
            }).catch(error => {
                console.log('=========upload/image error', error)
            })


        // console.log('====image', this.state.imageUrlBg)
        // let file = imageUrl;
        // this.props.uploadImg({ file });
    }
    handleDisabledChange = image => {
        this.setState({ image });
    };
    handleTrademarkChange = trademark => {
        this.setState({ trademark });
    };
    handleWatermarkChange = watermark => {
        this.setState({ watermark });
    };
    back() {
        this.props.history.push('/storyBoardsList');
    }
    createScenes() {
        let { createStoryBoards } = this.props;
        if (createStoryBoards._id) {
            this.props.history.push(`/createStoryBoardsSences/${createStoryBoards._id}`);
        } else {
            this.props.history.push('/createStoryBoardsSences');
        }
    }
    saveStoryBoards() {
        let stbId = this.props.match.params.stbId;
        if (stbId) {
            let { stb } = this.state;
            let scenes = [];
            if (stb && stb.scenes) {
                scenes = stb.scenes;
            }
            if (scenes.length === 0) return message.error('至少存在一个幻灯片');
            this.props.updateStb({ stbId, data: stb });
            message.success('保存成功');

        } else {
            let { user } = this.props;
            if (!user.profile) {
                message.error('请先登录');
                return this.props.history.push('/storyBoardsList');
            }
            let data = { bgImage: "", isImported: false, logo: "", notes: "", scenes: [], styles: [], title: '测试1', theme: "blue", watermark: "", thumbnail: "http://b-ssl.duitang.com/uploads/item/201208/30/20120830173930_PBfJE.jpeg" }
            this.props.saveStoryBoards(data);
            message.success('保存成功');
        }


    }
    render() {
        const uploadButton = (
            <div style={{ textAlign: 'center' }}>
                {/* <Icon type={this.state.loading ? 'loading' : 'plus'} /> */}
                <div className="ant-upload-text" style={{ widht: '100px', height: '100px', backgroundColor: 'rgb(57,63,76)' }}></div>
            </div>
        );
        let { image, trademark, watermark, imageUrl } = this.state;
        // console.log('=====imageUrl', imageUrl)
        const { TextArea } = Input
        // const fileList = [
        //     {
        //       uid: '-1',
        //       name: 'xxx.png',
        //       status: 'done',
        //       url: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        //       thumbUrl: 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png',
        //     }
        //   ];

        //   const props = {
        //     action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
        //     listType: 'picture',
        //     defaultFileList: [...fileList],
        //   };

        let { storyboard } = this.props;
        let scenes = [];
        if (storyboard && storyboard.scenes) {
            scenes = storyboard.scenes;
        }
        let stbId = this.props.match.params.stbId;
        let { stb } = this.state;
        return (

            <div className="storyboard_content">
                <div className="storyboard_colse">
                    <Icon type="arrow-left" onClick={this.back} />&nbsp;&nbsp;
                    {!stbId && <span>创建故事板</span>}
                    {stbId && <span>编辑故事板</span>}
                    {/* <span>添加故事板</span> */}
                </div>
                {stbId ?
                    <div>
                        {storyboard && storyboard.title &&
                            <div className="scences_box">
                                {
                                    scenes.map((item) => (
                                        <ScenesItem key={item._id} scenesItem={item} />
                                    ))
                                }
                                <div className="contentScenes">
                                    <div className="content_title">Untitled</div>
                                    <div className="content_jia">
                                        <Link to={`/createStoryBoardsSences/${storyboard._id}`}>
                                            <Icon type="plus" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                    :
                    <div className="contentScenes">
                        <div className="content_title">Untitled</div>
                        <div className="content_jia" onClick={this.createScenes}>
                            <Icon type="plus" />
                        </div>
                    </div>
                }


                <div className="storyboard_option">
                    <div className="option_btn">
                        <Button ghost shape="round" className="option_button">重置</Button>
                        <Button type="primary" shape="round" className="option_button" onClick={this.saveStoryBoards}>保存</Button>
                    </div>
                    <div className="option_color">
                        <p>场景背景</p>
                        <div className="color_click">
                            <Radio.Group name="radiogroup" defaultValue={1}>
                                <Radio value={1}></Radio>
                                <Radio value={2}></Radio>
                                <Radio value={3}></Radio>
                                <Radio value={4}></Radio>
                                <Radio value={5}></Radio>
                            </Radio.Group>
                        </div>
                    </div>
                    <div className="option_image">
                        <div className="image_title">
                            <p>背景图像</p>
                            {/* <Switch  size="small" checked={image} onChange={this.handleDisabledChange}/> */}
                        </div>
                        <Button type="primary" shape="round" className="image_button">上载</Button>
                        <div className="image_slider">
                            <p>不透明度</p>
                        </div>
                        <div>
                            <Slider defaultValue={30} disabled={image} />
                        </div>
                    </div>
                    <div className="option_trademark">
                        <div className="trademark_title">
                            <p>所有胶片的商标</p>
                            {/* <Switch  size="small" checked={trademark} onChange={this.handleTrademarkChange}/> */}
                        </div>
                        <div className="trademark_img">
                            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                        </div>
                        <Upload
                            name="avatar"
                            showUploadList={false}
                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                            beforeUpload={beforeUpload}
                            onChange={this.handleChange}
                        >
                            <Button type="primary" shape="round" className="thumbnail_button">上载</Button>
                        </Upload>

                    </div>
                    <div className="option_watermark">
                        <div className="watermark_title">
                            <p>所有胶片的商标</p>
                            {/* <Switch  size="small" checked={watermark} onChange={this.handleWatermarkChange}/> */}
                        </div>
                        <Button type="primary" shape="round" className="watermark_button">上载</Button>
                        <p className="watermark_p">尺寸</p>
                        <Slider defaultValue={30} disabled={watermark} />
                        <p className="watermark_p">不透明度</p>
                        <Slider defaultValue={30} disabled={watermark} />
                    </div>
                    <div className="option_thumbnail">
                        <div className="thumbnail_title">
                            <p>所有胶片的商标</p>
                        </div>
                        <div className="trademark_img">
                            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                        </div>
                        <Upload
                            name="avatar"
                            showUploadList={false}
                            action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                            beforeUpload={beforeUpload}
                            onChange={this.handleChange}
                        >
                            <Button type="primary" shape="round" className="thumbnail_button">上载</Button>
                        </Upload>
                    </div>
                    <div className="option_thumbnail">
                        <div className="thumbnail_title">
                            <p>封面</p>
                        </div>
                        <div className="trademark_img">
                            {imageUrl ? <img src={imageUrl} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                        </div>
                        <Upload
                            name="avatar"
                            showUploadList={false}
                            action="https://rtc.ivage.com:30443/api/v1/upload/image"
                            method="post"
                            beforeUpload={beforeUpload}
                            onChange={this.handleChange1}
                        >
                            <Button type="primary" shape="round" className="thumbnail_button">上载</Button>
                        </Upload>
                    </div>
                    <div className="option_remarks">
                        <p>备注</p>
                        <TextArea rows={4} placeholder="请填写备注" />
                    </div>
                </div>
            </div>

        )
    }
}
const mapStateToProps = (state) => {
    console.log('===================state', state)
    return {
        storyboards: state.teevid.api.storyboards,
        storyboard: state.teevid.api.storyboard,
        createStoryBoards: state.createStoryBoards,
        user: state.teevid.user,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        uploadImg: (data) => {
            var action = actions.uploadImg(data);
            dispatch(action);
        },
        saveStoryBoards: (data) => {
            var action = actions.saveStoryBoards(data);
            dispatch(action);
        },
        storyboardFetch: (data) => {
            var action = actions.storyboardFetch(data);
            dispatch(action);
        },
        initCreateStb: () => {
            var action = actions.initCreateStb();
            dispatch(action);
        },
        updateStb: (data) => {
            var action = actions.updateStb(data);
            dispatch(action);
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateStoryBoards);

// export default Form.create()(CreateStoryBoards);