
# Distribution

## IDE

npm install uglify-js -g   
source bundle.sh

## Any app

source bundle.sh src/assets/apps/app.dlite

# Server stack

- Apache2 version >= 2.4 (mod PHP)
- PHP version >= 7, module php-zip
- Sendmail version >=8 + configurer php.ini pour que l'envoie de mails en interne soit possible via la fonction mail() de PHP
- Un répertoire Apache document root accessible en lecture/écriture par nous pour pouvoir déployer l'application et faire les mises à jour... ce répertoire contiendra les fichiers PHP, html, JS, CSS, etc...
- Un répertoire DATA accessible en lecture/écriture par nous et par Apache pour les données de l'application (il nous faudra le chemin absolu de ce répertoire pour que l'application puisse y accéder)

- Optionnel (une fois en prod) : mettre en place une sauvegarde régulière du répertoire DATA

Note 1: prévoir tout de même quelques itérations avec l'infra pour les configurations éventuelles liées à l'environnement AFNOR. 

Note 2: pour l'instant on créera les comptes des utilisateurs de tests (avec emails AFNOR) dans le système, mais on fera un SSO connecté à l'AFNOR pour la version de prod finale.

# Todo

- Remove $tool stored array functions
 
