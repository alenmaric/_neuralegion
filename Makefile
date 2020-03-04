export PROJECT_IP = 127.0.0.1

DOCKER = docker
DOCKER_COMPOSE = docker-compose
DOCKER_IMAGES_LIST := $(docker images -qa -f dangling=true)

#COLOURS
GREEN  := $(shell tput -Txterm setaf 2)
WHITE  := $(shell tput -Txterm setaf 7)
YELLOW := $(shell tput -Txterm setaf 3)
CYAN_BG := $(shell tput -Txterm setab 6)

HELP_FUN = \
	%help; \
	while(<>) { push @{$$help{$$2 // 'options'}}, [$$1, $$3] if /^([a-zA-Z\-]+)\s*:.*\#\#(?:@([a-zA-Z\-]+))?\s(.*)$$/ }; \
	print "usage: make [target]\n\n"; \
	for (sort keys %help) { \
	print "${WHITE}$$_:${RESET}\n"; \
	for (@{$$help{$$_}}) { \
	$$sep = " " x (32 - length $$_->[0]); \
	print "  ${YELLOW}$$_->[0]${RESET}$$sep${GREEN}$$_->[1]${RESET}\n"; \
	}; \
	print "\n"; }

help: ##@other Show this help.
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)
.PHONY: help

start: ##@development bring up dev environment
	$(DOCKER_COMPOSE) up
.PHONY: start

stop: ##@development stop servers
	$(DOCKER_COMPOSE) stop -t 1
.PHONY: stop

clean: stop ##@setup stop and remove containers
	$(DOCKER_COMPOSE) down --remove-orphans
	@if [ -n "$(DOCKER_IMAGES_LIST)" ]; then \
        $(DOCKER) rmi "$(DOCKER_IMAGES_LIST)"; \
    fi
	$(MAKE) clean-vendor
.PHONY: clean

build: ##@setup build docker images
	$(DOCKER_COMPOSE) build
.PHONY: build

setup: ##@setup Create dev enviroment
	@if [ "$(OS)" != "Windows_NT" ]; then grep -q "^${PROJECT_IP} web$$" /etc/hosts || sudo sh -c "echo '${PROJECT_IP} web' >> /etc/hosts"; fi
	@if [ "$(OS)" != "Windows_NT" ]; then grep -q "^${PROJECT_IP} db$$" /etc/hosts || sudo sh -c "echo '${PROJECT_IP} db' >> /etc/hosts"; fi
.PHONY: setup

clean-vendor: ##@development remove vendor
	@if [ -d "vendor" ]; then rm -rf vendor; fi
.PHONY: clean-vendor

composer-install: ##setup install composer packages
	$(PHP) sh -c "cd /var/www/site && composer install"
.PHONY: composer-install


