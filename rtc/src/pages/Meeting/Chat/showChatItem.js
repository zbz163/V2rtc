import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from "moment";
import * as actions from './action.js';
import "./showChatItem.css"

class ChatItem extends React.Component {
  constructor() {
    super(...arguments);
    this.translator = this.translator.bind(this);
  }
  translator() {
    let { message, _id } = this.props;
    var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
    if (reg.test(message)) {
      this.props.translator({ from: 'ZH-CN', to: 'en', text: message, _id });
    } else {
      this.props.translator({ from: 'en', to: 'ZH-CN', text: message, _id });
    }
  }
  render() {
    let { name, message, time, id, participant,translations,_id } = this.props;
    let isTranslator = false;
    let translationsMessage = null;
    translations.map((item1)=>{
      if(item1._id === _id){
        if(item1.translations){
          isTranslator = true;
          translationsMessage = item1.translations;
        }
        
      }
    })
    let firstName = name.substring(0, 1);
    let sendTime = moment(time).format('HH:mm:ss');
    let participantId = '';
    if (participant) {
      participantId = participant.id;
    }
    return (
      <li className={"item_chat_li " + (id === participantId ? "active" : "")}>
        <div className="item_chat_box">
          <div className="item_chat_box_right">
            <div className="item_chat_box_right_name">{firstName}</div>
          </div>
          <div className="item_chat_box_left">
            <div className="item_chat_box_left_time">{sendTime}</div>
            <div className="item_chat_box_left_title"><span className="item_chat_box_left_title_name">{name}: </span><span>{message}</span>
              {!isTranslator &&
                <span onClick={this.translator} className="item_chat_box_left_title_img_box">
                  <img className="item_chat_box_left_title_img" src={require('../../../images/translate.svg')} alt="" />
                </span>
              }
            </div>
            {isTranslator &&
              <div className="item_chat_box_left_translations">
                <span className="item_chat_box_left_translations_message">{translationsMessage}</span>
              </div>
            }

          </div>
        </div>
      </li>
    );
  };
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    translator: (data) => {
      var action = actions.translator(data);
      dispatch(action);
    }
  }
};

const mapStateToProps = (state) => {
  return {
    participant: state.teevid.meeting.participant,
    translations:state.translations,
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChatItem);