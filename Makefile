SRC := $(wildcard src/*.js)
SPECS := $(wildcard specs/*.js)
JsTestDriver = $(shell find tools -name "JsTestDriver-*.jar" -type f)

all: tests docs build

clean-docs:
	-rm -rf docs/latest/

docs: clean-docs
	java -jar tools/JsDoc/jsrun.jar \
		tools/JsDoc/app/run.js src \
		-r=2 \
		-d=docs/latest/ \
		-t=tools/JsDoc/templates/jsdoc
		
tests: tests-node tests-jstd
		
tests-jstd:
	java -jar $(JsTestDriver) \
		--tests all
	
tests-node:
	node tools/jasmine-node.js lib/require.js \
		$(SRC) \
		specs/specHelper.js \
		$(SPECS)
	
clean-build:
	-rm -rf build/

build: clean-build Emily.js Emily.min.js
	cp LICENSE build/
	
release: all
ifndef VERSION
	@echo "You must give a VERSION number to make release"
	@exit 2
endif

	mkdir -p release/tmp/Emily-$(VERSION)
	cp build/* release/tmp/Emily-$(VERSION)
	
	cd release/tmp/Emily-$(VERSION); \
	sed -i .bak 's#<VERSION>#'$(VERSION)'#' Emily.js Emily.min.js; \
	rm Emily.js.bak Emily.min.js.bak
	
	cd release/tmp/; \
	tar czf ../Emily-$(VERSION).tgz Emily-$(VERSION)
	
	rm -rf release/tmp/
	
	cp -rf docs/latest/ docs/$(VERSION)/
	
Emily.js: $(SRC)
	mkdir -p build
	cat LICENSE-MINI $(SRC) > build/$@
	
Emily.min.js: Emily.js
	java -jar tools/GoogleCompiler/compiler.jar \
		--js build/Emily.js \
		--js_output_file build/Emily.min.js \
		--create_source_map build/Emily-map
		
clean: clean-build 
	
gh-pages:
ifndef VERSION
	@echo "You must give a VERSION number to make gh-pages"
	@exit 2
endif

	git checkout gh-pages
	
	git checkout master Makefile
	git checkout master docs; git add docs
	git checkout master src; git add src
	git checkout master specs; git add specs
	git checkout master tools; git add lib
	git checkout master lib; git add lib
	git checkout master release; git add release
	
	sed -i .bak 's#version">.*<#version">'${VERSION}'<#g' index.html
	sed -i .bak 's#<a href="release/Emily.*\.tgz">#<a href="release/Emily-'${VERSION}'.tgz">#' index.html
	rm index.html.bak

	git commit -am "updated to $(VERSION)"
	
	git push
	
	git checkout master
	
	git push
	
	
.PHONY: docs clean-docs clean-build build tests release clean gh-pages	