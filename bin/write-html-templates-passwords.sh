#!/bin/bash -ex

BASEDIR="$(readlink -f $( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )/..)"

PASSWORDSFILE="$BASEDIR/etc/html-templates-passwords.txt"
HTPASSWDFILE="$BASEDIR/html-templates/passwd"

if [ ! -f "$HTPASSWDFILE" ]; then
    touch "$HTPASSWDFILE"
fi

while IFS= read -r line
do
    username="$(echo $line | sed 's/:.*//')"
    password="$(echo $line | sed 's/.*://')"
    if htpasswd -vb "$HTPASSWDFILE" "$username" "$password"; then
        echo "Username and password OK for $username"
    else
        echo "Username and password needs updating for $username"
        htpasswd -b "$HTPASSWDFILE" "$username" "$password"
    fi
done < "$PASSWORDSFILE"
