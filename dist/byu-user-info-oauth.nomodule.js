var ByuUserInfoOAuth = (function () {
    'use strict';

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

    var EVENT_PREFIX = 'byu-browser-oauth';

    var STATE_CHANGE_EVENT = EVENT_PREFIX + "-state-changed";
    var LOGIN_REQUESTED_EVENT = EVENT_PREFIX + "-login-requested";
    var LOGOUT_REQUESTED_EVENT = EVENT_PREFIX + "-logout-requested";
    var STATE_REQUESTED_EVENT = EVENT_PREFIX + "-state-requested";

    var STATE_INDETERMINATE = 'indeterminate';
    var STATE_UNAUTHENTICATED = 'unauthenticated';
    var STATE_AUTHENTICATED = 'authenticated';

    var store = {state: STATE_INDETERMINATE};

    var observer = onStateChange(function (detail) {
        store = detail;
    });

    function onStateChange(callback) {
        var func = function(e) {
            callback(e.detail);
        };
        document.addEventListener(STATE_CHANGE_EVENT, func, false);
        if (store.state === STATE_INDETERMINATE) {
            dispatch(STATE_REQUESTED_EVENT, {callback: callback});
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
        var promise = promiseState([STATE_AUTHENTICATED]);
        dispatch(LOGIN_REQUESTED_EVENT);
        return promise;
    }

    function logout() {
        var promise = promiseState([STATE_UNAUTHENTICATED]);
        dispatch(LOGOUT_REQUESTED_EVENT);
        return promise;
    }

    function promiseState(desiredStates) {
        if (!window.Promise) {
            return null;
        }
        return new Promise(function (resolve, reject) {
            var observer = onStateChange(function (ref) {
                var state = ref.state;
                var token = ref.token;
                var user = ref.user;
                var error = ref.error;

                if (error) {
                    reject(error);
                    observer.offStateChange();
                } else if (desiredStates.indexOf(state) >= 0) {
                    resolve({state: state, token: token, user: user});
                    observer.offStateChange();
                }
            });
        });
    }

    function dispatch(name, detail) {
        var event;
        if (typeof window.CustomEvent === 'function') {
            event = new CustomEvent(name, {detail: detail});
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
            this._observer = onStateChange(function (e) { return this$1.authStateChanged(e); });
        };

        ByuUserInfoOAuth.prototype.disconnectedCallback = function disconnectedCallback () {
            if (this._observer) {
                this._observer.offStateChange();
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
                el.innerText = user$$1.name.displayName;

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

        console.log('userInfo.children', userInfo.children);

        el.appendChild(userInfo);
    }

    return ByuUserInfoOAuth;

}());
//# sourceMappingURL=byu-user-info-oauth.nomodule.js.map
