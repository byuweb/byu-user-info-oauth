const EVENT_PREFIX = 'byu-browser-oauth';

const EVENT_STATE_CHANGE = `${EVENT_PREFIX}-state-changed`;
const EVENT_LOGIN_REQUESTED = `${EVENT_PREFIX}-login-requested`;
const EVENT_LOGOUT_REQUESTED = `${EVENT_PREFIX}-logout-requested`;
const EVENT_CURRENT_INFO_REQUESTED = `${EVENT_PREFIX}-current-info-requested`;
const STATE_UNAUTHENTICATED = 'unauthenticated';
const STATE_AUTHENTICATED = 'authenticated';

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

class AuthenticationObserver {
    constructor(callback, { notifyCurrent = true } = {} ) {
        this._listener = function (e) {
            callback(e.detail);
        };
        document.addEventListener(EVENT_STATE_CHANGE, this._listener, false);
        if (notifyCurrent) {
            dispatch(EVENT_CURRENT_INFO_REQUESTED, { callback });
        }
    }

    disconnect() {
        document.removeEventListener(EVENT_STATE_CHANGE, this._listener, false);
    }
}

async function login() {
    const promise = promiseState([STATE_AUTHENTICATED]);
    dispatch(EVENT_LOGIN_REQUESTED);
    return promise;
}

async function logout() {
    const promise = promiseState([STATE_UNAUTHENTICATED]);
    dispatch(EVENT_LOGOUT_REQUESTED);
    return promise;
}

function promiseState(desiredStates) {
    if (!window.Promise) {
        return {then: () => {}, catch: () => {}, finally: () => {}};
    }
    return new Promise((resolve, reject) => {
        const observer = new AuthenticationObserver(({ state, token, user, error }) => {
            if (error) {
                reject(error);
                observer.offStateChange();
            } else if (desiredStates.indexOf(state) >= 0) {
                resolve({ state, token, user });
                observer.disconnect();
            }
        });
    });
}

function dispatch(name, detail) {
    let event;
    if (typeof window.CustomEvent === 'function') {
        event = new CustomEvent(name, { detail });
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
        this._observer = new AuthenticationObserver(e => this.authStateChanged(e));
    }

    disconnectedCallback() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        this._userInfo = null;
    }

    authStateChanged({ state: state$$1, token: token$$1, user: user$$1, error }) {
        const userElement = this._userInfo.querySelector('[slot="user-name"]');
        const hasUserElement = !!userElement;
        if (user$$1) {
            const el = hasUserElement ? userElement : this.ownerDocument.createElement('span');
            el.setAttribute('slot', 'user-name');
            el.innerText = user$$1.name.givenName;

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
    signIn.setAttribute('style', 'cursor:pointer');
    signIn.addEventListener('click', evt => {
        login();
        evt.stopPropagation();
        evt.preventDefault();
    });

    const signOut = doc.createElement('a');
    signOut.innerText = 'Sign Out';
    signOut.setAttribute('slot', 'logout');
    signOut.setAttribute('style', 'cursor:pointer');
    signOut.addEventListener('click', evt => {
        logout();
        evt.stopPropagation();
        evt.preventDefault();
    });

    userInfo.appendChild(signIn);
    userInfo.appendChild(signOut);

    el.appendChild(userInfo);
}

export default ByuUserInfoOAuth;
//# sourceMappingURL=byu-user-info-oauth.js.map
