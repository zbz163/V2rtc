import * as types from './actionType';

export default (state = '', action) => {
    switch (action.type) {
        case types.CONNECTION_SUCCESS_RESULT:{
            return "0"
        }
        case types.CONNECTION_ERROR_RESULT: {
            return "1"
        }
        case types.CONNECTION_DisConnect_RESULT:{
            console.log('----------------------CONNECTION_DisConnect_RESULT')
            return "2"
        }

        default: {
            return state
        }
    }
}