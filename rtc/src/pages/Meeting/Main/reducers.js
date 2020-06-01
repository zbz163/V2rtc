import * as types from './actionType';
import _ from 'underscore';

export default (state = '', action) => {

  switch (action.type) {
    case types.RECORDING_BEGIN: {
      let data = _.extend({},action.data);
      data.endTime = null;
      data.recordingState = "0"
      return data;
    }
    case types.RECORDING_END: {
      let data = _.extend({},action.data);
      data.recordingState = "1"
      return data;
    }
    case types.RECORDING_ERROR: {
      let data = _.extend({},action.data);
      data.recordingState = "2"
      return data;
    }
    default: {
      return state;
    }
  }
}