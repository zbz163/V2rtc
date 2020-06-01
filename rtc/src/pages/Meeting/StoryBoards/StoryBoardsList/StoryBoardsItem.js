import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from "react-router-dom";
import { Modal, message } from 'antd'

import * as actions from './action.js';

const { confirm } = Modal;
class StoryBoardsItem extends React.Component {
    constructor(props) {
        super(props);
        this.handleTabClick = this.handleTabClick.bind(this);
        this.removeStoryBoard = this.removeStoryBoard.bind(this);
    }
    handleTabClick(tabActiveIndex) {
        this.setState({
            tabActiveIndex
        })
    }
    removeStoryBoard(event) {
        let that = this;
        let stbId = event.target.getAttribute("data-stbid");
        confirm({
            title: '确定删除当前故事板?',
            okText: '确认',
            cancelText: '取消',
            onOk() {
                that.props.removeStoryBoard({ stbId });
            }
        });

    }
    render() {
        let { storyboardsItem } = this.props;
        return (
            <li>
                <div className="template_p">
                    <div className={"li_img "} >
                        <img data-stbid={storyboardsItem._id} src={storyboardsItem.thumbnail} style={{ width: '100%', height: '100%' }} />
                        <div className={"li_option "}>
                            <div className="option_content">
                                <div className="btn_box">
                                    <Link to={`/createNewStoryBoards/${storyboardsItem._id}`}>
                                        <div className="content_btn">编辑</div>
                                    </Link>
                                    <div className="content_btn" data-stbid={storyboardsItem._id} onClick={this.removeStoryBoard}>删除</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <p className="li_title">{storyboardsItem.title}</p>
                <p className="li_number">{storyboardsItem.scenes}场景</p>
            </li>
        );
    };
}

function mapDispatchToProps(dispatch, ownProps) {
    return {
        removeStoryBoard: (data) => {
            var action = actions.removeStoryBoard(data);
            dispatch(action);
        }
    }

}
export default connect(null, mapDispatchToProps)(StoryBoardsItem);