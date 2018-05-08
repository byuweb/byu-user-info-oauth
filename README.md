# byu-browser-oauth-implicit
OAuth Implicit Grant provider for byu-browser-oauth

# Usage

```html
<head>
    <script type="module" src="https://cdn.byu.edu/byu-user-info-oauth/latest/byu-user-info-oauth.min.js"></script>
    <script nomodule async src="https://cdn.byu.edu/byu-user-info-oauth/latest/byu-user-info-oauth.nomodule.min.js"></script>
    
    <!-- Also import byu-theme-components -->
    <!-- You'll also need an oauth provider, like browser-oauth-implicit -->

</head>
<body>
    <byu-header>
        <byu-user-info-oauth slot="user"></byu-user-info-oauth>
    </byu-header>
</body>

```