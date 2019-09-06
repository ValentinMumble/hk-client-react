Apache configuration

```lang-bsh
Alias "/hk" "/var/www/html/hk/react-client/build"
<Directory "/var/www/html/hk/react-client/build">
  <If "%{REMOTE_ADDR} != '92.88.249.60'">
    AuthType Basic
    AuthName "restricted area"
    AuthUserFile /home/pi/.htpasswd
    require valid-user
  </If>
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
