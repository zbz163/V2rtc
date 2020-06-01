import * as types from './actionType';

export default (state = '', action) => {
    switch (action.type) {
        case types.LOGIN_ACCOUNT_SUCCESS: {
            return {
                accountToken: action.data.accountToken,
                accountInfo: action.data.accountInfo
            }
        }
        case types.LOGIN_USER_SUCCESS: {
            return {
                user: {
                    accessToken: action.data.accessToken,
                    userInfo: action.data.userInfo,
                    companyName: action.data.companyName,
                    companyLogoUrl:action.data.companyLogoUrl,
                }
            }
        }
        case types.LOGOUT_USER_SUCCESS: {
            return {
                accountToken: "",
                accountInfo: {},
                user: {}
            }
        }
        default: {
            return state
        }
    }
}