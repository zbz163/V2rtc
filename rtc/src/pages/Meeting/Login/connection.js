import { put, takeEvery, select, all } from 'redux-saga/effects';
import * as Type from './actionType';
const actionTypes = TeeVidSdk.actionTypes;
import axios from 'axios';
import { storageUtils } from '../../../utils';
var roomConnection;
var currlocalStream;
export const createLocalStream = (
    connection,
    mode = 'interactive',
    constraints) => { // checking for audio and video devices
    if (connection
        && connection.state === 2) {
        roomConnection = connection;
        /** @type {TeeVid.Stream} */
        const localStream = TeeVidSdk.Stream(constraints);
        currlocalStream = localStream;
        return initLocalStream(localStream)
            .then(stream => publishStream(stream, connection));
    }
    return Promise.resolve();
};
export const initLocalStream = (stream) =>
    new Promise((resolve, reject) => {
        stream.addEventListener('access-accepted', () => {
            if (!stream.stream) {
                return reject(new Error({ message: 'Stream is not ready or is already published' }));
            }
            return resolve(stream);
        });
        if (!stream.hasScreen()) {
            stream.addEventListener('access-denied', function (e) {
                return reject(e);
            });
        }
        stream.init();
    });

export const publishStream = (stream, connection, callback) => {
    if (stream) {
        return new Promise((resolve, reject) => {
            if (callback) {
                connection = roomConnection;
                connection.publish(stream, {}, (id, error) => {
                    if (error) {
                        return reject(error);
                    }
                    TeeVidSdk.actions.setSharingStream(id);
                    TeeVidSdk.actions.streamSubscribed(stream)
                    return resolve(stream);
                });

            } else {
                connection = roomConnection;
                connection.publish(stream, {}, (id, error) => {
                    if (error) {
                        return reject(error);
                    }
                    return resolve(stream);
                });
            }
        });
    } else {
        return Promise.reject('no-stream-provided');
    }

};
export const unPublishStream = (stream, callback) => {
    if (stream)
        return new Promise((resolve, reject) => {
            if (callback) {
                if (roomConnection && roomConnection.state === 2) {
                    roomConnection.unpublish(stream, callback);
                } else {
                    callback(null, "Connection error.");
                }
            }
        });
    return Promise.reject('no-stream-provided');
};
export function* LoginSaga() {
    yield all([
        takeEvery(Type.LOGIN, login),
        takeEvery(Type.LOGOUT, logout),
        takeEvery(actionTypes.LOGIN_SUCCESS, function* () {
            yield put({ type: Type.LOGIN_SUCCESS_RESULT })
        }),
        takeEvery(actionTypes.LOGIN_ERROR, function* (error) {
            console.log('====error login', error)
            yield put({ type: Type.LOGIN_ERROR_RESULT, date: error });
        }),

        //join room begin

        takeEvery(Type.CONNECT, participantWorker),
        takeEvery(actionTypes.CONNECTION_ERROR, function* (error) {
            if (error.payload.message == "room-not-found-error") {
                return yield put({ type: Type.CONNECTION_ERROR_RESULT, date: error });
            }
            if (error.payload.code === 500 && error.payload.message === "jwt expired") {
                const a = yield TeeVidSdk.actions.logout();
            } else {
                yield put({ type: Type.CONNECTION_ERROR_RESULT, date: error });
            }
        }),
        // create connection
        takeEvery(actionTypes.CREATE_PARTICIPANT_SUCCESS, connectionWorker),
        // prepare connection: add event handlers and such
        takeEvery(actionTypes.CREATE_CONNECTION_SUCCESS,
            function* ({ payload: connection }) {
                yield TeeVidSdk.actions.connect();
            }),
        // connect
        takeEvery(actionTypes.CONNECTION_READY, function* () {
            const connection = yield select((state) => state.teevid.meeting
                .connection);
            const a = connection.connect();
        }),
        // room is connected
        takeEvery(actionTypes.ROOM_READY, function* () {
            // get constraints
            const connection = yield select((state) => state.teevid.meeting
                .connection);
            const options = yield select((state) => state.teevid.meeting
                .participant.status);
            const room = yield select((state) => state.teevid.meeting.room);
            const audio = yield select((state) => state.teevid.api.audioDevices[0] || null);
            const video = yield select((state) => state.teevid.api.videoDevices[0] || null);
            const participant = yield select((state) => state.teevid.meeting.participant);
            room.enabledTranslate = true;//enable translate
            // create streams
            try {
                yield put({ type: Type.CONNECTION_SUCCESS_RESULT });
                yield createLocalStream(connection,
                    null, { audio: options.hasMic, video: options.hasCam }, room)
                    .then(stream => {
                        TeeVidSdk.actions.setCurrentMediaDevices({ audio, video });
                        TeeVidSdk.actions.localStreamAdded(stream);
                        TeeVidSdk.actions.setConnectionState(2);
                    });
                // publish streams
            } catch (error) {
                console.error('===============ROOM_READY error', error);
                yield TeeVidSdk.actions.setMode('interactive');
                // TeeVidSdk.actions.disconnect();
                // yield TeeVidSdk.actions.logout();
                yield storageUtils.SetAccountUserInfo("");
                yield storageUtils.SetMeetingInfo("");
                yield put({ type: Type.LOGOUT_SUCCESS });
                yield put({ type: Type.CONNECTION_DisConnect_RESULT });
            }
        }),
        //join room end
        takeEvery(Type.SET_OWNER_PIN, setOwnerPin),
        takeEvery(Type.LOGOUT_MODERATOR, logoutModerator),

        takeEvery(actionTypes.OWNER_PIN_SUCCESS, function* (data) {
            yield put({ type: Type.OWNER_PIN_SUCCESS_RESULT });
        }),
        takeEvery(actionTypes.OWNER_PIN_FAILED, function* (error) {
            console.error('===error pin', error)
            yield put({ type: Type.OWNER_PIN_ERROR_RESULT });
        }),

    ])
}

function* logoutModerator(data) {
    const a = yield TeeVidSdk.actions.roleChanged(data.participantId, 'Participant', false);
    yield put({ type: Type.OWNER_PIN_Log_Out_RESULT });
}
function* setOwnerPin(data) {
    try {
        yield put(TeeVidSdk.cleanActions.setOwnerPin({ 'ownerPin': data.pin }));
    } catch (error) {
        console.error('******pin set error', error)
    }
}

function* login(data) {
    try {
        yield TeeVidSdk.actions.login(data.name, data.password);
    } catch (error) {
        console.log('=========login====file', error)
    }
}

function* participantWorker({ payload: { room, username, pin } }) {
    try {
        if (username && room) {
            yield TeeVidSdk.actions.createParticipant(room, username, pin);
        } else {
            if (!username) TeeVidSdk.actions.generalError({ message: 'connection-username-err' });
            if (!room) TeeVidSdk.actions.generalError({ message: 'connection-room-id-err' });
        }
    } catch (error) {
        console.error('error*******', error);
    }
}
function* connectionWorker() {
    yield TeeVidSdk.actions.createConnection();
}
function* logout() {
    yield TeeVidSdk.actions.logout();
    yield put({ type: Type.LOGOUT_SUCCESS });
}
