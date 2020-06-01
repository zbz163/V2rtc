import React, {Component} from 'react';
// import React, { Component } from 'react';
import {connect} from 'react-redux';
import ChatItem from './showChatItem';

class ShowChat extends Component {
    constructor(props, context){
        super(props, context);
    }
    render(){
        let {v2Message} = this.props;
        return (
            <ul className="todo-list">
            {
                v2Message.map((item) => (
                    <ChatItem
                        key    = {item.time}
                        name   = {item.author.name}
                        message= {item.message}
                        time   = {item.time}
                        id     ={item.author.id}
                        _id    ={item._id}
                    />
                 ))
                }
            </ul>
        )
    }
}
const mapStateToProps = (state) => {
    return {
        v2Message: state.v2Message,        
    };
  }

export default connect(mapStateToProps)(ShowChat);