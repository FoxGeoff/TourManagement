# Project Log
***
7/9/2018

IDE Visual Sudio 2017 for TourManagementAPI
IDE VSCode for Angular TourManagementClient

## API setup SSL

API Set as https://localhost:44394/ (44353)

## Client setup SSL:

#1 Set this in enviroment.ts:  apiUrl: 'https://localhost:44394'
#2 Get Cert from code: certicate.pem and privatekey.key
#3 ng serve --ssl 1 -o --ssl-key privatekey.key --ssl-cert certificate.pem
Note: SSL self signed cert works in Chrome, not Edge or Firefox
	Use MMC plugin to install cert on computer and user account.
#4 Setthe defaults of the serve command (angular-cli.json)

     },
  "defaults": {
    "styleExt": "css",
    "serve": {
      "ssl": true,
      "sslCert": "certificate.pem",
      "sslKey": "privatekey.key"
    },

## Add project IdentityServer

