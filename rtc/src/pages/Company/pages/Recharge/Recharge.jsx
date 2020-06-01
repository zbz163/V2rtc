import React, { Component } from 'react';
import { Button , Icon} from 'antd';
import './Recharge.css';

class Recharge extends Component {
    constructor(props){
        super(props);
        this.state={
            tabActiveIndex: 0,
            money:'block',
            mode:'none',
            result:'none'
        }
    }
    handleTabClick(e, q) {
        console.log(e,q)
        this.setState({
            value: q 
        })
    }
    copeWith(){
        this.setState({
            money: 'none',
            mode:'block'
        })
    }
    copeMode(){
        this.setState({
            money: 'block',
            mode:'none'
        })
    }
    alipay(){
        console.log('支付宝支付')
        this.setState({
            result: 'block',
            mode:'none'
        })
    }
    wechat(){
        console.log('微信支付')
        this.setState({
            result: 'block',
            mode:'none'
        })
    }
    render() {
        return (
            <div className="recharge">
                <div className="top_change">
                    <div className="top_money"><p>充值金额</p><div className="money_xian"></div></div>
                    <div className="top_mode"><p>支付方式</p><div className="mode_xian"></div></div>
                    <div className="top_result"><p>支付结果</p></div>
                </div>
                <div className="money_box" style={{ display: this.state.money}}>
                    <ul>
                        <li className="rechargeList_one" onClick={this.handleTabClick.bind(this, 0, '5000')}>
                            <div className="rechargeList_one_box rechargeList_text">5000元</div>
                        </li>
                        <li className="rechargeList_two" onClick={this.handleTabClick.bind(this, 1 , '4000')}>
                            <div className="rechargeList_two_box rechargeList_text">4000元</div>
                        </li>
                        <li className="rechargeList_three" onClick={this.handleTabClick.bind(this, 2, '3500')}>
                            <div className="rechargeList_three_box rechargeList_text">3500元</div>
                        </li>
                        <li className="rechargeList_four" onClick={this.handleTabClick.bind(this, 3, '3000')}>
                            <div className="rechargeList_four_box rechargeList_text">3000元</div>
                        </li>
                        <li className="rechargeList_five" onClick={this.handleTabClick.bind(this, 4, '2500')}>
                            <div className="rechargeList_five_box rechargeList_text">2500元</div>
                        </li>
                        <li className="rechargeList_six" onClick={this.handleTabClick.bind(this, 5, '2000')}>
                            <div className="rechargeList_six_box rechargeList_text">2000元</div>
                        </li>
                        <li className="rechargeList_seven" onClick={this.handleTabClick.bind(this, 6, '1500')}>
                            <div className="rechargeList_seven_box rechargeList_text">1500元</div>
                        </li>
                        <li className="rechargeList_eight" onClick={this.handleTabClick.bind(this, 7, '1000')}>
                            <div className="rechargeList_eight_box rechargeList_text">1000元</div>
                        </li>
                        <li className="rechargeList_nine">
                            <div className="rechargeList_nine_box rechargeList_text">xxx元</div>
                        </li>
                    </ul>
                    <div className="cope_with">
                        <div className="cope_title"><span>应付金额：</span><span>{this.state.value}元</span></div>
                        <Button type="primary" style={{marginTop:'8px'}} onClick={this.copeWith.bind(this)}>立即充值</Button>
                    </div>
                </div>
                <div className="mode_box" style={{ display: this.state.mode}}>
                    <div  className="mode_list_box">
                        <div className="mode_list">
                            <div className="mode_list_left mode_list_public" onClick={this.alipay.bind(this)}>支付宝支付</div>
                            <div className="mode_list_right mode_list_public"  onClick={this.wechat.bind(this)}>微信支付</div>
                        </div>
                        <p className="mode_title">支付金额：<span>{this.state.value}</span>&nbsp;元</p>
                        <Button type="primary" style={{marginTop:'8px'}} onClick={this.copeMode.bind(this)}>取消订单</Button>
                    </div>
                </div>
                <div className="result_box" style={{ display: this.state.result}}>
                    <Icon type="loading" />
                    <p>正在生产支付二维码...</p>
                </div>
            </div>
        )
    }
}

export default Recharge;