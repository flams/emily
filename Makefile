###############################################################################################
# Emily http://flams.github.com/emily
# The MIT License (MIT)
# Copyright (c) 2012-2103 Olivier Scherrer <pode.fr@gmail.com>
#
# Targets:
#
# make tests-jstd: runs the JsTestDriver tests
# make tests-node: runs the tests under node.js
# make tests-promiseA: runs the tests against promise/A specs
# make tests: runs both tests
#
# make docs: generates the documentation into docs/latest
# make build: generates Emily.js and Emily.min.js as they appear in the release
#
# make all: tests + docs + build
#
# make release VERSION=x.x.x: make all, then creates the package and pushes to github
#
# make gh-pages VERSION=x.x.x: generates the web site with latest version and pushes to github
#
################################################################################################

SRC := $(wildcard src/*.js)
SPECS := $(wildcard specs/*.js)
JsTestDriver = $(shell find tools -name "JsTestDriver-*.jar" -type f)

all: tests docs build

clean-docs:
	-rm -rf docs/latest/

clean-build:
	-rm -rf build/

clean-temp:
	rm -f temp.js

docs: clean-docs
	java -jar tools/JsDoc/jsrun.jar \
		tools/JsDoc/app/run.js src \
		-r=2 \
		-d=docs/latest/ \
		-t=tools/JsDoc/templates/jsdoc

tests: tests-node tests-jstd

tests-jstd: clean-temp temp.js
	java -jar $(JsTestDriver) \
		--tests all

tests-node: clean-temp temp.js
	node tools/jasmine-node.js lib/require.js \
		temp.js \
		specs/specHelper.js \
		$(SPECS)

tests-promiseA:
	node tools/promise-test/runTestA.js

tests-promiseAplus:
	node tools/promise-test/runTestAplus.js

build: clean-build Emily.js
	cp LICENSE build/
	cp -rf src/ build/src/

release: all
ifndef VERSION
	@echo "You must give a VERSION number to make release"
	@exit 2
endif

	mkdir -p release/tmp/Emily-$(VERSION)
	cp -rf build/* release/tmp/Emily-$(VERSION)

	cd release/tmp/Emily-$(VERSION); \
	sed -i .bak 's#<VERSION>#'$(VERSION)'#' Emily.js Emily.min.js; \
	rm Emily.js.bak Emily.min.js.bak

	cd release/tmp/; \
	tar czf ../Emily-$(VERSION).tgz Emily-$(VERSION)

	rm -rf release/tmp/

	cp -rf docs/latest/ docs/$(VERSION)/

	git add build docs release

	git commit -am "released version $(VERSION)"

	git push

	git tag $(VERSION)

	git push --tags

temp.js:
	browserify -e ./src/Emily.js -o temp.js -s emily

Emily.js: temp.js
	mkdir -p build
	cat LICENSE-MINI temp.js > build/$@

	java -jar tools/GoogleCompiler/compiler.jar \
		--js build/Emily.js \
		--js_output_file build/Emily.min.js \
		--create_source_map build/Emily-map

clean: clean-build clean-docs

gh-pages:
ifndef VERSION
	@echo "You must give a VERSION number to make gh-pages"
	@exit 2
endif

	git checkout gh-pages

	git checkout master build Makefile docs src specs tools lib release
	git add build docs src specs tools lib release

	sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
	sed -i .bak 's#<a href="release/Emily.*\.tgz">#<a href="release/Emily-'${VERSION}'.tgz">#' index.html
	rm index.html.bak

	git commit -am "updated to $(VERSION)"

	git push

	git checkout master


.PHONY: docs clean-docs clean-build build tests release clean gh-pages
