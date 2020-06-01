import types from './actionTypes';

export default Object.freeze({
    connect: (username, room, pin, connectAnyway) => ({
        type: types.CONNECT,
        payload: { username, room, pin, connectAnyway }
    }),
    disConnected: () => ({
        type: types.CONNECTION_DISCONNECT
    }),
    login: (username, password) => ({
        type: types.LOGIN,
        payload: { username, password }
    })

});