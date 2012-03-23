#!/bin/bash

VERSION=$1

#update generated documentation
git checkout master docs

#update specs files
git checkout master specs

#update tests
git checkout master tools/Jasmine-runner
git checkout master tests.html

#update libs
git checkout master lib

#update build files
git checkout master build

#generate Emily archive
cp -rf build Emily-${VERSION}
tar czf Emily.tgz Emily-${VERSION}
rm -rf Emily-${VERSION}