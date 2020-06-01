import * as types from './actionType';

export default (state = '', action) => {
    switch (action.type) {
        case types.SAVE_COMPANY_SUCCESS:{
            return action.data.CompanyInfo;
        }
        case types.SAVE_COMPANY_ERROR:{
            return {};
        }
        default: {
            return state
        }
    }
}