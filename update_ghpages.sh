#!/bin/bash
die () {
    echo >&2 "$@"
    exit 1
}

ME=`basename $0`

[ "$#" -eq 1 ] || die "you should provide a version number like: ./${ME} 1.1.2"

VERSION=$1

echo "updating generated documentation..."
git checkout master docs

echo "updating specs files for unit tests..."
git checkout master specs

echo "updating test runner..."
git checkout master tools/Jasmine
git checkout master tests.html

echo "updating libs..."
git checkout master lib

echo "updating the homepage with the version number..."
sed -i .bak 's#version">.*<#version">'${VERSION}'<#' index.html
sed -i .bak 's#<a href="Emily.*\.tgz">#<a href="Emily-'${VERSION}'.tgz">#' index.html
rm index.html.bak

echo "updating the built files..."
git checkout master build

echo "updating license..."
sed -i .bak 's#${VERSION}#'${VERSION}'#' build/Emily.js
rm build/Emily.js.bak

echo "removing old archive..."
rm Emily-*.tgz

echo "generating new Emily archive..."
cp -rf build Emily-${VERSION}
tar czf Emily-${VERSION}.tgz Emily-${VERSION}
rm -rf Emily-${VERSION}
git add Emily-${VERSION}.tgz