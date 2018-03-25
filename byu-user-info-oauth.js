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

import * as authn from './node_modules/@byuweb/browser-oauth/byu-browser-oauth.js';

export default class ByuUserInfoOAuth extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        renderEmpty(this);
        this._observer = new authn.AuthenticationObserver(e => this.authStateChanged(e));
    }

    disconnectedCallback() {
        if (this._observer) {
            this._observer.disconnect();
            this._observer = null;
        }
        this._userInfo = null;
    }

    authStateChanged({ state, token, user, error }) {
        const userElement = this._userInfo.querySelector('[slot="user-name"]');
        const hasUserElement = !!userElement;
        if (user) {
            const el = hasUserElement ? userElement : this.ownerDocument.createElement('span');
            el.setAttribute('slot', 'user-name');
            el.innerText = user.name.givenName;

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
        authn.login();
    });

    const signOut = doc.createElement('a');
    signOut.innerText = 'Sign Out';
    signOut.setAttribute('slot', 'logout');
    signOut.addEventListener('click', () => {
        authn.logout();
    });

    userInfo.appendChild(signIn);
    userInfo.appendChild(signOut);

    el.appendChild(userInfo);
}
