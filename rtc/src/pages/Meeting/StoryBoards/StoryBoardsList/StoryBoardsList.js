import React, { Component } from 'react'
import { Input, Button, Icon } from 'antd'
import { connect } from 'react-redux';
import StoryBoardsItem from './StoryBoardsItem';
import './StoryBoardsList.css';

import LoginPanel from '../../Login/loginPanel/LoginPanel';

class StoryBoardsList extends Component {
    constructor(props) {
        super(props);
        this.createNewStoryBoards = this.createNewStoryBoards.bind(this);
        this.back = this.back.bind(this);
        this.state = {
            tabActiveIndex: true,
            menu: 'none'
        }
    }
    createNewStoryBoards() {
        this.props.history.push('/createNewStoryBoards');
    }
    handleTabClick(tabActiveIndex) {
        this.setState({
            tabActiveIndex
        })
    }
    menu() {
        if (this.state.menu == 'none') {
            this.setState({
                menu: 'block',
            })
        }
        else if (this.state.menu == 'block') {
            this.setState({
                menu: 'none',
            })

        }
    }
    back() {
        this.props.history.push('/meeting');
    }
    render() {
        let tabActiveIndex = this.state.tabActiveIndex;
        let { storyboards, loginState } = this.props;
        console.log('======storyboards', storyboards)
        return (

            <div className="template">

                <div className="template_search">
                    <div className="back">
                        <Icon type="arrow-left" onClick={this.back} />
                    </div>
                    <div className="search_f">
                        <Input placeholder="请输入搜索内容" />
                        <Button type="primary" shape="round" className="search_button" onClick={this.menu.bind(this)}>新建</Button>
                    </div>
                    <div style={{ display: this.state.menu }}>
                        <div className="onlist">
                            <div className="create_new_storyBoards" onClick={this.createNewStoryBoards}>创建新的</div>
                            {/* <div>文件导入</div>
                            <div>使用链接</div> */}
                        </div>
                    </div>
                </div>
                <p className="template_title">故事板</p>
                {loginState === "0" && <div className="no_login">请先登录</div>}
                {(loginState === "0" || loginState === "2") && <LoginPanel />}


                {loginState === "1" && storyboards.length === 0 && <div className="no_storyboards">当前没有故事板，快去添加吧！！！</div>}
                {loginState === "1" && storyboards.length !== 0 &&
                    <ul>
                        {
                            storyboards.map((item) => (
                                <StoryBoardsItem key={item._id} storyboardsItem={item} />
                            ))
                        }
                    </ul>
                }

            </div>

        )
    }
}

const mapStateToProps = (state) => {
    console.log('===================state', state)
    return {
        storyboards: state.teevid.api.storyboards,
        loginState: state.loginState,
    };
}
function mapDispatchToProps(dispatch, ownProps) {
    return {

    }
}

export default connect(mapStateToProps, mapDispatchToProps)(StoryBoardsList);

// export default createStoryBoards;