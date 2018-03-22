/*
 * Copyright 2018 Brigham Young University
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const EVENT_PREFIX = 'byu-browser-oauth';

const STATE_CHANGE_EVENT = `${EVENT_PREFIX}-state-changed`;
const LOGIN_REQUESTED_EVENT = `${EVENT_PREFIX}-login-requested`;
const LOGOUT_REQUESTED_EVENT = `${EVENT_PREFIX}-logout-requested`;
const STATE_REQUESTED_EVENT = `${EVENT_PREFIX}-state-requested`;

const STATE_INDETERMINATE = 'indeterminate';
const STATE_UNAUTHENTICATED = 'unauthenticated';
const STATE_AUTHENTICATED = 'authenticated';

let store = {state: STATE_INDETERMINATE};

let observer = onStateChange(detail => {
    store = detail;
});

function onStateChange(callback) {
    const func = function(e) {
        callback(e.detail);
    };
    document.addEventListener(STATE_CHANGE_EVENT, func, false);
    if (store.state === STATE_INDETERMINATE) {
        dispatch(STATE_REQUESTED_EVENT, {callback});
    } else {
        callback(store);
    }
    return {
        offStateChange: function() {
            document.removeEventListener(STATE_CHANGE_EVENT, func, false);
        }
    }
}

function login() {
    const promise = promiseState([STATE_AUTHENTICATED]);
    dispatch(LOGIN_REQUESTED_EVENT);
    return promise;
}

function logout() {
    const promise = promiseState([STATE_UNAUTHENTICATED]);
    dispatch(LOGOUT_REQUESTED_EVENT);
    return promise;
}

function promiseState(desiredStates) {
    if (!window.Promise) {
        return null;
    }
    return new Promise((resolve, reject) => {
        const observer = onStateChange(({state, token, user, error}) => {
            if (error) {
                reject(error);
                observer.offStateChange();
            } else if (desiredStates.indexOf(state) >= 0) {
                resolve({state, token, user});
                observer.offStateChange();
            }
        });
    });
}

function dispatch(name, detail) {
    let event;
    if (typeof window.CustomEvent === 'function') {
        event = new CustomEvent(name, {detail});
    } else {
        event = document.createEvent('CustomEvent');
        event.initCustomEvent(name, true, false, detail);
    }
    document.dispatchEvent(event);
}

/*
 * Copyright 2018 Brigham Young University
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class ByuUserInfoOAuth extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        renderEmpty(this);
        this._observer = onStateChange(e => this.authStateChanged(e));
    }

    disconnectedCallback() {
        if (this._observer) {
            this._observer.offStateChange();
        }
        this._userInfo = null;
    }

    authStateChanged({state: state$$1, token: token$$1, user: user$$1, error}) {
        const userElement = this._userInfo.querySelector('[slot="user-name"]');
        const hasUserElement = !!userElement;
        if (user$$1) {
            const el = hasUserElement ? userElement : this.ownerDocument.createElement('span');
            el.setAttribute('slot', 'user-name');
            el.innerText = user$$1.name.displayName;

            if (!hasUserElement) {
                this._userInfo.appendChild(el);
            }
        } else if (hasUserElement) {
            this._userInfo.removeChild(userElement);
        }
        //TODO: Handle error cases
    }
}

window.customElements.define('byu-user-info-oauth', ByuUserInfoOAuth);

function renderEmpty(el) {
    const doc = el.ownerDocument;

    const userInfo = doc.createElement('byu-user-info');

    el._userInfo = userInfo;

    const signIn = doc.createElement('a');
    signIn.innerText = 'Sign In';
    signIn.setAttribute('slot', 'login');
    signIn.addEventListener('click', () => {
        login();
    });

    const signOut = doc.createElement('a');
    signOut.innerText = 'Sign Out';
    signOut.setAttribute('slot', 'logout');
    signOut.addEventListener('click', () => {
        logout();
    });

    userInfo.appendChild(signIn);
    userInfo.appendChild(signOut);

    console.log('userInfo.children', userInfo.children);

    el.appendChild(userInfo);
}

export default ByuUserInfoOAuth;
//# sourceMappingURL=byu-user-info-oauth.js.map
