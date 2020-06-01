import React, { Component } from 'react'
import './Profile.css'
import { Form, Button, message } from 'antd';
import { connect } from 'react-redux';
import * as actions from './action.js';
import Drawers from './../Drawer/Drawer';
import Password from './../Password/Password';
import axios from 'axios';
class Profile extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            logoUrl: "",
        }
    }
    componentWillMount() {
        let { account, push } = this.props;
        let accountInfo = {};
        let accountTotal = null;
        let logoUrl = "";
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
            if (account.accountInfo.remainMoneyFen && account.accountInfo.remainMoneyFen >= 0) {
                accountTotal = (parseFloat(account.accountInfo.remainMoneyFen) / 100).toFixed(2);
            }
            if (accountInfo.logoUrl) {
                logoUrl = accountInfo.logoUrl;
            }
            this.setState({ logoUrl });
        } else {
            // message.error("请先登录");
            push('/login');
        }
    }
    reloadAccountInfo() {
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
        axios.get('/rtc/api/account/baseInfo', { headers: { "accesstoken": account.accountToken } })
            .then(res => {
                if (res.status === "OK") {
                    that.props.loginAccount({ accountToken: account.accountToken, accountInfo: res.result });
                    that.setState({ logoUrl: res.result.logoUrl });
                } else if (res.status === "ERROR") {
                    return message.error(res.error.message);
                }
            }).catch(error => {
                message.error(error);
                return push('/login');
            })
    }
    render() {
        let { logoUrl } = this.state;
        let { account } = this.props;
        let accountInfo = {};
        let accountTotal = null;
        if (account && account.accountInfo) {
            accountInfo = account.accountInfo;
        }
        return (
            <div className="profile_box">
                <div className="head_portrait">
                    <div className="portrait_box">
                        {logoUrl &&
                            <img src={logoUrl} alt="" />
                        }
                        {!logoUrl &&
                            <img src={require('../../../../images/avatar.jpg')} alt="" />
                        }
                    </div>
                    <div className="profile_btn">
                        <Drawers reloadAccountInfo={this.reloadAccountInfo.bind(this)}  push={this.props.push} />
                        <Password push={this.props.push} />
                    </div>
                </div>
                {/* 暂时隐藏充值 */}
                {accountInfo && accountInfo.accountName &&
                    <div className="head_content">
                        <p><span>公司账号：</span><span>{accountInfo.accountName}</span></p>
                        <p><span>公司名称 ：</span><span>{accountInfo.companyName}</span></p>
                        {/* <p><span>账户余额：</span><span>{accountTotal}元</span></p>
                        <Button type="primary">充值</Button> */}
                    </div>
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    console.log('*******account state', state)
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
export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(Profile));