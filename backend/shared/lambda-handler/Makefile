.PHONY: compile
compile:
	npm run -- tsc --noEmitOnError

.PHONY: test
test: compile
	npm run test

.PHONY: lint
lint:
	npm run lint

.PHONY: lint-check
lint-check:
	npm run lint-check

.PHONY: coverage-report
coverage-report:
	if [ -d coverage/lcov-report ]; then xdg-open coverage/lcov-report/index.html; else echo "Generate coverage with 'make test'"; exit 1; fi
