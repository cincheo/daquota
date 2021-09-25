
//<!--    <script src="https://cdn.jsdelivr.net/npm/client-oauth2@4.3.3/src/client-oauth2.min.js"></script>-->


let auth2 = new ClientOAuth2({
    clientId: '1021494562283-h7veq0cka8ejqtrah7renf5phm213fdo.apps.googleusercontent.com',
    //clientSecret: '123',
    accessTokenUri: 'https://accounts.google.com/o/oauth2/token',
    authorizationUri: 'https://accounts.google.com/o/oauth2/auth',
    //redirectUri: 'https://platform.dlite.io/callback',
    scopes: ['cloud-platform']
})



