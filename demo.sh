#!/bin/sh

echo "Select test:"
echo " 1 - verify (requires JWT)"
echo " 2 - validate (requires JWT and projectId, plus optional userId)"
echo -n "> "
read X

if test "$X" = "1"; then
  node demo/verify.js
elif test "$X" = "2"; then
  node demo/validate.js
else
  echo "Invalid choice"
fi
