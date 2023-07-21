.PHONY: build
build:
	npx dirbuild@0.5.0

.PHONY: build-no-cache
build-no-cache: clean
	npm ci
	npm run -- build

.PHONY: lint
lint:
	npm run -- lint

.PHONY: lint-check
lint-check:
	npm run -- lint-check

.PHONY: compile
compile:
	npm run -- compile

.PHONY: clean
clean:
	rm -rf .next/lambdaBuild
	rm -rf .next/static

.PHONY: storybook-build
storybook-build:
	npm run storybook-build

.PHONY: test
test:
ifndef CI
	npm run test
else
	npm run test -- --maxWorkers 2  # see https://github.com/facebook/jest/issues/5239
endif

.PHONY: coverage-report
coverage-report:
	if [ -d coverage/lcov-report ]; then xdg-open coverage/lcov-report/index.html; else echo "Generate coverage with 'make test'"; exit 1; fi
