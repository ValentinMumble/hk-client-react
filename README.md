# HK React client

> React version of a HK client

## Install

```bash
$ npm install
```

Create the .env file using provided .env.dist

## Run

```bash
$ npm start
```

## Apache configuration

```lang-bsh
Alias "/hk" "/var/www/html/hk/react-client/build"
<Directory "/var/www/html/hk/react-client/build">
  Options FollowSymLinks
  AllowOverride All
  Require all granted
  RewriteEngine on
  RewriteBase /hk
  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d [OR]
  RewriteCond %{REQUEST_URI} !^/[^/]+/symfony-server/*$ [NC]
  RewriteRule ^ - [L]
  # Rewrite everything else to index.html to allow html5 state links
  RewriteRule ^ index.html [L]
</Directory>
```
