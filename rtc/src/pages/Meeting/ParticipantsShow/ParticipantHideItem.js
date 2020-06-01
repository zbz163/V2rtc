import React, { Component } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux';
import './ParticpantShowItem.css';

class ParticipantHideItem extends Component {
    render() {
        let { item } = this.props;
        console.log('-----item', item);
        return (
            <li className="ches_list_bg todo-item">
                <div className="list_portrait"><img alt="" /></div>
                <div className="list_name">
                    <div className="list_names">{item.realName}</div>
                    <div className="list_audio">
                    </div>
                </div>
            </li>
        )
    }
}
export default connect()(ParticipantHideItem);