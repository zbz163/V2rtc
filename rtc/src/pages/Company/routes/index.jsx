import React, { Component } from 'react';
import { Icon, Modal, message } from 'antd'
import axios from 'axios';
import Recharge from "../pages/Recharge/Recharge"
import Profile from "../pages/Profile/Profile"
import Orders from "../pages/Orders/Orders"
import Dosages from "../pages/Dosages/Dosages"
import Users from "../pages/Users/Users";
// import Users from '../pages/Users/Users.test';
// import Users from '../pages/Users/Users.test2';
import Meetings from '../pages/Meetings/Meetings';
import Framework from '../pages/Framework/Framework';
import Rooms from '../pages/Rooms/Rooms';
// import Framework from '../pages/Framework/Framework.test';
import MeetingLog from '../pages/MeetingLog/MeetingLog';
import { storageUtils } from '../../../utils';

import './index.css'

const { confirm } = Modal;
class RouterCustom extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tabActiveIndex: 0,
            navBox: [
                { key: 0, title: "账户信息", path: "/company/profile" },
                // { key: 1, title: "充值中心", path: "/company/recharge" },
                // { key: 2, title: "订单管理", path: "/company/orders" },
                // { key: 3, title: "消费记录", path: "/company/dosages" },
                { key: 4, title: "用户管理", path: "/company/users" },
                { key: 6, title: "会议管理", path: "/company/meetings" },
                { key: 8, title: "会议室管理", path: "/company/rooms" },
                { key: 7, title: "组织架构", path: "/company/framework" },
                { key: 9, title: "参会日志", path: "/company/meetingLog" },
                { key: 5, title: "退出登录", path: "/company/exit" },
                
            ]
        }
    }

    showConfirm = () => {
        let that = this;
        confirm({
            title: '确认退出登录?',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                axios.get('/rtc/api/account/logout')
                    .then(res => {
                        if (res.status === "OK") {
                            (async () => {
                                await storageUtils.SetUserAccountPwd("");
                                return that.props.history.push('/login');
                            })()
                        }
                    }).catch(error => {
                        message.error(error);
                    })
            }
        });
    }
    render() {
        let tabActiveIndex = this.state.tabActiveIndex;
        return (
            <div>
                <div style={{ width: '100%', height: '14vh', borderBottom: '1px solid #d4d4d4' }}></div>
                <div className="router_box">
                    <div className="router_list">
                        <div className={(tabActiveIndex === 0 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 0)}><Icon type="user" />&nbsp;账户信息</div>
                        {/* <div className={(tabActiveIndex === 1 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 1)}><Icon type="transaction" />&nbsp;充值中心</div>
                        <div className={(tabActiveIndex === 2 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 2)}><Icon type="shopping-cart" />&nbsp;订单管理</div>
                        <div className={(tabActiveIndex === 3 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 3)}><Icon type="solution" />&nbsp;消费记录</div> */}
                        <div className={(tabActiveIndex === 4 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 4)}><Icon type="team" />&nbsp;用户管理</div>
                        <div className={(tabActiveIndex === 6 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 6)}><Icon type="desktop" />&nbsp;会议管理</div>
                        <div className={(tabActiveIndex === 8 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 8)}><Icon type="bank" />&nbsp;会议室管理</div>
                        <div className={(tabActiveIndex === 7 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 7)}><Icon type="cluster" />&nbsp;组织架构</div>
                        <div className={(tabActiveIndex === 9 ? 'active_list' : '')} onClick={this.handleTabClick.bind(this, 9)}><Icon type="book" />&nbsp;参会日志</div>
                        <div className={(tabActiveIndex === 5 ? 'active_list' : '')} onClick={this.showConfirm}><Icon type="export" />&nbsp;退出登录</div>
                    </div>
                    <div className="router_content">
                        {tabActiveIndex === 0 ?
                            <div className={"router_hide active"}>
                                <Profile push={this.props.history.push} />
                            </div>
                            : null
                        }

                        {tabActiveIndex === 1 ?
                            <div className={"router_hide active"}>
                                <Recharge/>
                            </div>
                            : null
                        }
                        {tabActiveIndex === 2 ?
                            <div className={"router_hide active"}>
                                <Orders/>
                            </div>
                            : null
                        }
                        {tabActiveIndex === 3 ?
                            <div className={"router_hide active"}>
                                <Dosages/>
                            </div>
                            : null
                        }
                        {tabActiveIndex === 4 ?
                            <div className={"router_hide active"}>
                                <Users push={this.props.history.push} />
                            </div>
                            : null
                        }
                        {tabActiveIndex === 6 ?
                            <div className={"router_hide active"}>
                                <Meetings push={this.props.history.push} />
                            </div>
                            : null
                        }
                        {tabActiveIndex === 8 ?
                            <div className={"router_hide active"}>
                                <Rooms push={this.props.history.push} />
                            </div>
                            : null
                        }
                        
                        {tabActiveIndex === 7 ?
                            <div className={"router_hide active"}>
                                <Framework push={this.props.history.push} />
                            </div>
                            : null
                        }
                        {tabActiveIndex === 9 ?
                            <div className={"router_hide active"}>
                                <MeetingLog push={this.props.history.push} />
                            </div>
                            : null
                        }
                    </div>
                </div>
            </div>

        )
    }
}
Object.assign(RouterCustom.prototype, {
    handleTabClick(tabActiveIndex) {
        let { navBox } = this.state;
        let that = this;
        navBox.map((item) => {
            if (item.key == tabActiveIndex) {
                that.props.history.push(item.path);
                that.setState({
                    tabActiveIndex
                })
            }
        })
    }
})
export default RouterCustom