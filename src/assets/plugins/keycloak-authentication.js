$tools.loadScript("assets/ext/keycloak-js@16.1.1.min.js", () => {
    window.plugins.keycloakAuthentication = {

        onSuccessfulSignIn: function () {
            let idTokenParsed = this.keycloak.idTokenParsed;
            console.log('email: ' + idTokenParsed.email); // Do not send to your backend! Use an ID token instead.
            //console.log('Name: ' + idTokenParsed.family_name);
            //console.log('Image URL: ' + idTokenParsed.getImageUrl());
            //console.log('Email: ' + idTokenParsed.getEmail()); // This is null if the 'email' scope is not present.
            ide.setUser({
                id: idTokenParsed.idTokenParsed.email,
                firstName: idTokenParsed.given_name,
                lastName: idTokenParsed.family_name,
                login: idTokenParsed.email,
                email: idTokenParsed.email,
                imageUrl: undefined
            });
            //ide.synchronize();
        },

        start: function () {
            ide.registerSignInFunction(window.plugins.keycloakAuthentication.signIn);

            let initOptions = {
                url: 'http://localhost:8080/auth',
                realm: 'elite',
                clientId: 'elite-dev',
                onLoad: 'login-required',
                checkLoginIframeInterval: 1
            }
            window.plugins.keycloakAuthentication.keycloak = Keycloak(initOptions);
            window.plugins.keycloakAuthentication.keycloak.init({onLoad: initOptions.onLoad}).then(async (auth) => {
                if (!auth) {
                    window.location.reload();
                } else {
                    //const tokenInfos = this.keycloak['idTokenParsed'];
                    // let userDto = await this.fetch("GET", "apex-iam", "/iam/accounts/email/" + tokenInfos['email'])
                    //     .then(data => data.result);
                    //
                    // if (window === window.top) {
                    //     this.fetch("PUT", "apex-iam", `/iam/accounts/${userDto.id}/last-connection-instant`);
                    // }
                    //
                    // // console.log("tokeninfos => ", tokenInfos);
                    // this.loggedUser = await User.init(userDto)
                    // this.eventHub.$emit('userLogged', { loggedUser: this.loggedUser });
                    // this.run(callback);
                    window.plugins.keycloakAuthentication.onSuccessfulSignIn();
                    if (callback) {
                        await callback();
                    }
                }
            });

            //Token Refresh
            setInterval(() => {
                this.keycloak.updateToken(5).then((refreshed) => {
                    if (refreshed) {
                        //console.info('Token refreshed' + refreshed);
                    } else {
                        //console.warn('Token not refreshed, valid for '
                        //    + Math.round(this.keycloak.tokenParsed.exp + this.keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
                    }
                }).catch((error) => {
                    console.error('Failed to refresh token', error);
                });
            }, 6000)

        },

        stop: function () {
            ide.unregisterSignInFunction(window.plugins.keycloakAuthentication.signIn);
        },

        signIn: function () {
            window.plugins.keycloakAuthentication.keycloak.login();
        }
    };

    ide.pluginLoaded('keycloakAuthentication');


});

