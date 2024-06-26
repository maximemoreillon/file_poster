#!/bin/sh

ROOT_DIR=/app

# Replace env vars in files served by NGINX
echo "Replacing environment variables"
for file in $ROOT_DIR/js/*.js* $ROOT_DIR/index.html $ROOT_DIR/precache-manifest*.js;
do
  echo "Processing $file ...";

  sed -i 's|VUE_APP_TARGET_URL_PLACEHOLDER|'${VUE_APP_TARGET_URL}'|g' $file
  sed -i 's|VUE_APP_FILES_PLACEHOLDER|'${VUE_APP_FILES}'|g' $file
  sed -i 's|VUE_APP_FIELDS_PLACEHOLDER|'${VUE_APP_FIELDS}'|g' $file
  sed -i 's|VUE_APP_HEADERS_PLACEHOLDER|'${VUE_APP_HEADERS}'|g' $file



done

echo "Starting Nginx"
nginx -g 'daemon off;'
