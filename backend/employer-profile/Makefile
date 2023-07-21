.PHONY: compile
compile:
	npm run -- tsc --noEmitOnError

.PHONY: run
run: compile
	node main.js

.PHONY: test
test: compile
ifndef CI
	npm run test
else
	npm run test -- --maxWorkers 2  # see https://github.com/facebook/jest/issues/5239
endif

.PHONY: lint
lint:
	npm run lint

.PHONY: lint-check
lint-check:
	npm run lint-check

.PHONY: coverage-report
coverage-report:
	if [ -d coverage/lcov-report ]; then xdg-open coverage/lcov-report/index.html; else echo "Generate coverage with 'make test'"; exit 1; fi
