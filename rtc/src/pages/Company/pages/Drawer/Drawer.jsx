import React, { Component } from 'react'
import { connect } from 'react-redux';
import { Drawer, Form, Button, Col, Row, Input, Upload, Icon, message } from 'antd';
import axios from 'axios';
import * as actions from './action.js';
import Tips from '../../../../config/Tips';

function getBase64(img, callback) {
    const reader = new FileReader();
    reader.addEventListener('load', () => callback(reader.result));
    reader.readAsDataURL(img);
}

function beforeUpload(file) {
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
class Drawers extends Component {
    state = {
        visible: false,
        loading: false,
        companyInfo: {},
        imageUrl: "",
        headers: {},
        path: ""
    };
    componentWillMount() {
        let that = this;
        let { account, push } = that.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            if (!account.accountInfo.companyName) {
                return push('/login');
            } else {
                companyInfo = account.accountInfo;
                if (companyInfo.logoUrl) {
                    that.setState({
                        path: companyInfo.logoUrl,
                    });
                }

            }
        }
    }
    showDrawer = () => {
        let that = this;
        let { account } = this.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            if (!account.accountInfo.companyName) {
                return message.error("请先登录");
            } else {
                companyInfo = account.accountInfo;
                that.setState({
                    visible: true,
                    companyInfo,
                    headers: { "accesstoken": account.accountToken }
                });
            }
        }
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };
    handleChange = info => {
        let that = this;
        if (info.file.status === 'uploading') {
            this.setState({ loading: true });
            return;
        }
        if (info.file.status === 'done') {
            let response = info.file.response;
            if (response.status === 'OK') {
                let fileList = response.result.fileList;
                if (fileList && fileList.length > 0) {
                    let path = fileList[0].path;
                    path = `https://rtc.ivage.com:8000${path}`;
                    // path = `https://localhost:8000${path}`;
                    that.setState({ path });
                } else {
                    return message.error('上传图片失败');
                }
            }
        }
    };
    getCompanyInfo() {
        let that = this;
        let { account, push } = this.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
            return push('/login');
        }
        axios.get('/rtc/api/account/baseInfo', { headers: { "accesstoken": account.accountToken } })
            .then(res => {
                if (res.status === "OK") {
                    that.props.loginAccount({ accountToken: account.accountToken, accountInfo: res.result });
                } else if (res.status === "ERROR") {
                    message.error(res.error.message);
                }
            }).catch(error => {
                message.error(error);
                return push('/login');
            })
    }
    handleSubmit = (e) => {
        e.preventDefault();
        let that = this;
        let { account, push } = this.props;
        let companyInfo = {};
        if (account && account.accountInfo) {
            companyInfo = account.accountInfo;
        }
        if (!companyInfo.companyName) {
            message.error("请先登录");
            return push('/login');
        }
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let { companyName } = values;
                if (!companyName) return message.error('公司名称不能为空');
                let { path } = that.state;
                if (!path) return message.error("logo不能为空");
                let data = { params: { companyName, logoUrl: path } };
                axios.put('/rtc/api/account/baseInfo', data, { headers: { "accesstoken": account.accountToken } })
                    .then(res => {
                        if (res.status === "OK") {
                            message.success('修改成功');
                            that.onClose();
                            that.props.reloadAccountInfo();
                        } else if (res.status === "ERROR") {
                            message.error(res.error.message);
                        }
                    }).catch(error => {
                        message.error(error);
                        return push('/login');
                    })
            }
        })
    }
    // customRequest = (option)=> {
    //     let { account, push } = this.props;
    //     let companyInfo = {};
    //     if (account && account.accountInfo) {
    //         companyInfo = account.accountInfo;
    //     }
    //     if (!companyInfo.companyName) {
    //         message.error("请先登录");
    //         return push('/login');
    //     }
    //     const formData = new FormData();
    //     formData.append('files[]',option.file);
    //     axios.post('/rtc/api/account/uploadLogo',{},{headers:{"accesstoken": account.accountToken}}).then((res)=>{
    //         console.log('====res upload',res)
    //     }).catch((err)=>{   
    //         console.log('===err',err)
    //     })
    // }
    checkCompanyName(rule, value, callback) {
        var len = 0;
        for (var i = 0; i < value.length; i++) {
            var a = value.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null){
                len += 2;
            }else{
                len += 1;
            }
        }
        if(len > 64){
            callback(global.companyName.writtenWords)
        }else {
            callback();
        }
    }
    render() {
        const { getFieldDecorator } = this.props.form;
        const uploadButton = (
            <div>
                <Icon type={this.state.loading ? 'loading' : 'plus'} />
                <div className="ant-upload-text">Upload</div>
            </div>
        );
        const { imageUrl, companyInfo, headers, path } = this.state;
        return (
            <div>
                <Button type="primary" onClick={this.showDrawer}>修改资料</Button>
                <Drawer title="修改资料" width={720} onClose={this.onClose} visible={this.state.visible}>
                    <Form layout="vertical" onSubmit={this.handleSubmit}>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="公司名称">
                                    {getFieldDecorator('companyName', {
                                        initialValue: companyInfo.companyName,
                                        rules: [{ required: true, message: '请输入公司名称' },{ validator: (rule, value, callback) => { this.checkCompanyName(rule, value, callback) } }], validateTrigger: 'onBlur',
                                    })(<Input placeholder="请输入公司名称" />)}
                                </Form.Item>
                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <Form.Item label="logo">
                                    <Upload
                                        name="avatar"
                                        listType="picture-card"
                                        className="avatar-uploader"
                                        showUploadList={false}
                                        action="/rtc/api/account/uploadLogo"
                                        // method="GET"
                                        headers={headers}
                                        beforeUpload={beforeUpload}
                                        onChange={this.handleChange}
                                    // customRequest={this.customRequest}
                                    >
                                        {path ? <img src={path} alt="avatar" style={{ width: '100%' }} /> : uploadButton}
                                    </Upload>
                                </Form.Item>
                            </Col>
                        </Row>
                        <div style={{ width: '100%', padding: '10px 16px', background: '#fff', textAlign: 'right', }}>
                            <Button onClick={this.onClose} style={{ marginRight: 8 }}>取消</Button>
                            <Button htmlType="submit" type="primary">提交</Button>
                        </div>
                    </Form>

                </Drawer>
            </div>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        account: state.account
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {
        loginAccount: (data) => {
            var action = actions.loginAccount(data);
            dispatch(action);
        },
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Drawers));