.PHONY: compile
compile:
	npm run -- tsc --noEmitOnError

.PHONY: run
run: compile
	node main.js

.PHONY: test
test: compile
	npm run test

.PHONY: lint
lint:
	npm run lint

.PHONY: lint-check
lint-check:
	npm run lint-check
