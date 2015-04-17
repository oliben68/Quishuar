version=$(shell cat .ver)
tar_name=$(shell cat .tar)
pwd=$(shell pwd)/
web_root=$(pwd)$(shell cat .deploy)
sys_tmp=$(shell cat .tmp)

HAML_GEM = $(shell gem list haml|grep 'haml' -c)
HAML_FILE = index.haml
HTML_FILE = index.html
HTML_LOC = $(pwd)/html
HTML_TMP_LOC = $(sys_tmp)/html
TARBALL = $(tar_name)$(version).gz
ARTIFACTS = ./artifacts/

.phony: all $(TARBALL)

all: $(TARBALL)

$(TARBALL): haml.tmp
	@cp $(HTML_FILE) $(HTML_LOC)/
	@cp -fr $(HTML_LOC) $(sys_tmp)/
	@rm $(HTML_LOC)/$(HTML_FILE)
	@find $(HTML_TMP_LOC) -type f -print0 | tar -czvf $(pwd)$(TARBALL) --null -T -
	@cp $(TARBALL) $(ARTIFACTS)
	@echo BUILD COMPLETED

haml.tmp: prereq.tmp
	@echo BUILDING $(HAML_FILE)
	haml --trace $(HAML_FILE) $(HTML_FILE)
	@touch haml.tmp

prereq.tmp:
	@echo CHECKING PRE-REQUISITES
ifeq '$(HAML_GEM)' '0'
	$(error Missing haml gem)
endif
	@touch prereq.tmp

deploy: $(ARTIFACTS)$(TARBALL)
	$(shell if [ -d "$(web_root)" ]; then rm -rf $(web_root))
	$(shell mkdir $(web_root))
	$(shell tar -zxvf $(ARTIFACTS)$(TARBALL) --strip-components=2 -C $(web_root))

clean:
	@rm *.tmp
	@rm $(TARBALL)
	@rm $(HTML_FILE)
	@rm -rf $(HTML_TMP_LOC)
	@echo FINISHED CLEAN-UP

clean-deploy:
	@rm -rf ./web
	@rm prereq.tmp
	@rm $(TARBALL)
	@rm $(HTML_FILE)
	@rm -rf $(HTML_TMP_LOC)
	@echo FINISHED CLEAN-UP	