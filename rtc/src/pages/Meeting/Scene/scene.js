
import React, { Component } from 'react';
import {Icon ,Button,Input,Form} from 'antd';
require('./scene.css')

const { TextArea } = Input;
class Scene extends Component{
    constructor(props){
        super(props);
        this.state={
            tabActiveIndex: 0
        }
    }
    render(){
        let option_title={
            fontSize:'18px',
            textAlign:'center'
        }
        let option_list={
            padding:'30px'
        }
        let list_table={
            width:'100%',
            height:'100px',
            background:'red',
            marginTop:'20px',
            cursor:'pointer'
        }
        let list_img={
            width:'100%',
            height:'100%',
            
        }
        let content_jia={
            width:'64vw',
            height:'64vh',
        }
        let content_list={
            width:'100%',
            height:'100%',
            background:'#fff',
            padding:'0'
        }
        let contentList_one={
            width:'50%',
            height:'50%',
            background:'rgb(65,73,90)',
            textAlign:'center',
            lineHeight:'32vh'
        }
        let contentList_two={
            width:'100%',
            height:'51.2vh',
            background:'rgb(65,73,90)',
            textAlign:'center',
            lineHeight:'51.2vh'
        }
        let contentList_three={
            width:'50%',
            height:'100%',
            background:'rgb(65,73,90)',
            textAlign:'center',
            lineHeight:'64vh'
        }
        let contentList_img={
            width:'75px',
            height:'90px'
        }
        let content_ipt={
            width:'70%',
            outline: 'none',
            background: 'rgba(0,0,0,0)',
            border: 'none',
            boxShadow: 'none',
            color:'rgba(255, 255, 255, 0.75)',
            fontSize:'24px',
            fontWeight:'800',
            paddingLeft:'10px',
            marginBottom:'20px'
        }
        let tabActiveIndex = this.state.tabActiveIndex;
        return (
            <div className="storyboard_content">
                <div className="storyboard_colse">
                    <Icon type="arrow-left" />&nbsp;&nbsp;
                    <span>添加故事板</span>
                </div>
                <div className="content">
                    <div className="content_title">
                        <Input placeholder="SCENE TITLE" style={content_ipt}/>
                    </div>
                    <div style={content_jia}>
                        <div style={content_list} className={"m-sys-view " + (tabActiveIndex === 0 ? 'active': '')}>
                            <div style={contentList_one}>
                                <img src={require('./../../../images/contentList.jpg')} style={contentList_img}/>
                            </div>
                        </div>
                        <div style={content_list} className={"m-sys-view " + (tabActiveIndex === 1 ? 'active': '')}>
                            <div style={contentList_two}>
                                <img src={require('./../../../images/contentList.jpg')} style={contentList_img}/>
                            </div>
                        </div>
                        <div style={content_list} className={"m-sys-view " + (tabActiveIndex === 2 ? 'active': '')}>
                            <div style={contentList_three}>
                                <img src={require('./../../../images/contentList.jpg')} style={contentList_img}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="storyboard_option">
                    <div className="option_btn">
                        <Button ghost shape="round" className="option_button">重置</Button>
                        <Button type="primary" shape="round" className="option_button">保存</Button>
                    </div>
                    <p className="option_title" style={option_title}>布局</p>
                    <div style={option_list}>
                        <div style={list_table} className={(tabActiveIndex === 0 ? 'option_s': '')} onClick={this.handleTabClick.bind(this, 0)}><img src={require('./../../../images/scene_one.jpg')} style={list_img}/></div>
                        <div style={list_table} className={(tabActiveIndex === 1 ? 'option_s': '')} onClick={this.handleTabClick.bind(this, 1)}><img src={require('./../../../images/scene_two.jpg')} style={list_img}/></div>
                        <div style={list_table} className={(tabActiveIndex === 2 ? 'option_s': '')} onClick={this.handleTabClick.bind(this, 2)}><img src={require('./../../../images/scene_three.jpg')} style={list_img}/></div>
                    </div>
                    {/* <div className="option_remarks">
                        <p>备注</p>
                        <TextArea rows={4} placeholder="请填写备注"/>
                    </div> */}
                </div>
            </div>
        )
    }
}
Object.assign(Scene.prototype, {
    handleTabClick(tabActiveIndex) {
        this.setState({
            tabActiveIndex
        })
    }
})


export default Form.create()(Scene);