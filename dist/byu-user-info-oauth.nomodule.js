var ByuUserInfoOAuth = (function () {
    'use strict';

    var EVENT_PREFIX = 'byu-browser-oauth';

    var EVENT_STATE_CHANGE = EVENT_PREFIX + "-state-changed";
    var EVENT_LOGIN_REQUESTED = EVENT_PREFIX + "-login-requested";
    var EVENT_LOGOUT_REQUESTED = EVENT_PREFIX + "-logout-requested";
    var EVENT_CURRENT_INFO_REQUESTED = EVENT_PREFIX + "-current-info-requested";
    var STATE_UNAUTHENTICATED = 'unauthenticated';
    var STATE_AUTHENTICATED = 'authenticated';

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

    var AuthenticationObserver = function AuthenticationObserver(callback, ref ) {
        if ( ref === void 0 ) ref = {};
        var notifyCurrent = ref.notifyCurrent; if ( notifyCurrent === void 0 ) notifyCurrent = true;

        this._listener = function (e) {
            callback(e.detail);
        };
        document.addEventListener(EVENT_STATE_CHANGE, this._listener, false);
        if (notifyCurrent) {
            dispatch(EVENT_CURRENT_INFO_REQUESTED, { callback: callback });
        }
    };

    AuthenticationObserver.prototype.disconnect = function disconnect () {
        document.removeEventListener(EVENT_STATE_CHANGE, this._listener, false);
    };

    async function login() {
        var promise = promiseState([STATE_AUTHENTICATED]);
        dispatch(EVENT_LOGIN_REQUESTED);
        return promise;
    }

    async function logout() {
        var promise = promiseState([STATE_UNAUTHENTICATED]);
        dispatch(EVENT_LOGOUT_REQUESTED);
        return promise;
    }

    function promiseState(desiredStates) {
        if (!window.Promise) {
            return {then: function () {}, catch: function () {}, finally: function () {}};
        }
        return new Promise(function (resolve, reject) {
            var observer = new AuthenticationObserver(function (ref) {
                var state = ref.state;
                var token = ref.token;
                var user = ref.user;
                var error = ref.error;

                if (error) {
                    reject(error);
                    observer.offStateChange();
                } else if (desiredStates.indexOf(state) >= 0) {
                    resolve({ state: state, token: token, user: user });
                    observer.disconnect();
                }
            });
        });
    }

    function dispatch(name, detail) {
        var event;
        if (typeof window.CustomEvent === 'function') {
            event = new CustomEvent(name, { detail: detail });
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

    var ByuUserInfoOAuth = (function (HTMLElement) {
        function ByuUserInfoOAuth() {
            HTMLElement.call(this);
        }

        if ( HTMLElement ) ByuUserInfoOAuth.__proto__ = HTMLElement;
        ByuUserInfoOAuth.prototype = Object.create( HTMLElement && HTMLElement.prototype );
        ByuUserInfoOAuth.prototype.constructor = ByuUserInfoOAuth;

        ByuUserInfoOAuth.prototype.connectedCallback = function connectedCallback () {
            var this$1 = this;

            renderEmpty(this);
            this._observer = new AuthenticationObserver(function (e) { return this$1.authStateChanged(e); });
        };

        ByuUserInfoOAuth.prototype.disconnectedCallback = function disconnectedCallback () {
            if (this._observer) {
                this._observer.disconnect();
                this._observer = null;
            }
            this._userInfo = null;
        };

        ByuUserInfoOAuth.prototype.authStateChanged = function authStateChanged (ref) {
            var state$$1 = ref.state;
            var token$$1 = ref.token;
            var user$$1 = ref.user;
            var error = ref.error;

            var userElement = this._userInfo.querySelector('[slot="user-name"]');
            var hasUserElement = !!userElement;
            if (user$$1) {
                var el = hasUserElement ? userElement : this.ownerDocument.createElement('span');
                el.setAttribute('slot', 'user-name');
                el.innerText = user$$1.name.givenName;

                if (!hasUserElement) {
                    this._userInfo.appendChild(el);
                }
            } else if (hasUserElement) {
                this._userInfo.removeChild(userElement);
            }
            //TODO: Handle error cases
        };

        return ByuUserInfoOAuth;
    }(HTMLElement));

    window.customElements.define('byu-user-info-oauth', ByuUserInfoOAuth);

    function renderEmpty(el) {
        var doc = el.ownerDocument;

        var userInfo = doc.createElement('byu-user-info');

        el._userInfo = userInfo;

        var signIn = doc.createElement('a');
        signIn.innerText = 'Sign In';
        signIn.setAttribute('slot', 'login');
        signIn.addEventListener('click', function () {
            login();
        });

        var signOut = doc.createElement('a');
        signOut.innerText = 'Sign Out';
        signOut.setAttribute('slot', 'logout');
        signOut.addEventListener('click', function () {
            logout();
        });

        userInfo.appendChild(signIn);
        userInfo.appendChild(signOut);

        el.appendChild(userInfo);
    }

    return ByuUserInfoOAuth;

}());
//# sourceMappingURL=byu-user-info-oauth.nomodule.js.map
