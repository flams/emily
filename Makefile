###############################################################################################
# emily http://flams.github.com/emily
# The MIT License (MIT)
# Copyright (c) 2012-2014 Olivier Scherrer <pode.fr@gmail.com>
#
# Targets:
#
# make test: runs the tests under node.js
# make test-promise: runs the tests against promise/A+ specs
#
# make docs: generates the documentation into docs/latest
# make build: generates emily.js and emily.min.js as they appear in the release
#
# make all: tests + docs + build
#
# make release VERSION=x.x.x: make all, then creates the package and pushes to github
#
# make gh-pages VERSION=x.x.x: generates the web site with latest version and pushes to github
#
################################################################################################

SRC := $(wildcard src/*.js)

all: test docs build

clean-temp:
	rm -f temp.js

clean-docs:
	-rm -rf docs/latest/

clean-build:
	-rm -rf build/

docs: clean-docs
	java -jar tools/JsDoc/jsrun.jar \
		tools/JsDoc/app/run.js src \
		-r=2 \
		-d=docs/latest/ \
		-t=tools/JsDoc/templates/jsdoc

test:
	jasmine-node specs/

test-promise:
	node tools/promise-test/runTest.js

jshint:
	jshint src/*.js specs/*.js

temp.js:
	browserify -r ./src/emily.js:emily -o temp.js

emily.js: temp.js
	mkdir -p build
	cat LICENSE-MINI temp.js > build/$@

emily.min.js: emily.js
	java -jar tools/GoogleCompiler/compiler.jar \
		--js build/emily.js \
		--js_output_file build/emily.min.js \
		--create_source_map build/emily-map

clean: clean-build clean-docs clean-temp

build: clean-build clean-temp emily.js emily.min.js
	cp LICENSE build/

release: all
ifndef VERSION
	@echo "You must give a VERSION number to make release"
	@exit 2
endif

	mkdir -p release/tmp/emily-$(VERSION)
	cp -rf build/* release/tmp/emily-$(VERSION)

	cd release/tmp/emily-$(VERSION); \
	sed -i .bak 's#<VERSION>#'$(VERSION)'#' emily.js emily.min.js; \
	rm emily.js.bak emily.min.js.bak

	cd release/tmp/; \
	tar czf ../emily-$(VERSION).tgz emily-$(VERSION)

	rm -rf release/tmp/

	cp -rf docs/latest/ docs/$(VERSION)/

	git add build docs release

	git commit -am "released version $(VERSION)"

	git push

	git tag $(VERSION)

	git push --tags

gh-pages:
ifndef VERSION
	@echo "You must give a VERSION number to make gh-pages"
	@exit 2
endif

	git checkout gh-pages

	git checkout master build Makefile docs src specs tools release
	git add build docs src specs tools release

	sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
	sed -i .bak 's#<a href="release/emily.*\.tgz">#<a href="release/emily-'${VERSION}'.tgz">#' index.html
	rm index.html.bak

	git commit -am "updated to $(VERSION)"

	git push

	git checkout master


.PHONY: docs clean-docs clean-build build tests release clean gh-pages jshint
