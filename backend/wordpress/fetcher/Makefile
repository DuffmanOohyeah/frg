.PHONY: build
build: deps

.PHONY: env
env: virtualenv

.PHONY: virtualenv
virtualenv:
	if [ ! -d "./venv" ]; then virtualenv venv --python=python3; fi
	./venv/bin/pip install -U pip pipenv==2022.07.24

.PHONY: deps
deps: virtualenv
	( \
		. ./venv/bin/activate; \
		pip install -r requirements.txt; \
	)

.PHONY: test
test: dev
	./venv/bin/coverage run setup.py test && ./venv/bin/coverage report -m

.PHONY: dev
dev: virtualenv deps
	( \
		. ./venv/bin/activate; \
		pip install -r requirements.txt; \
	)


.PHONY: lint
lint: dev
	./venv/bin/yapf --recursive --in-place fetcher/ tests/
	./venv/bin/unify --recursive --in-place $(shell ls fetcher | grep -v deps | sed 's|^|fetcher/|') tests/

.PHONY: lint-check
lint-check: dev
	./venv/bin/yapf --recursive --diff fetcher/ tests/
	./venv/bin/unify --recursive --check-only $(shell ls fetcher | grep -v deps | sed 's|^|fetcher/|') tests/

.PHONY: coverage-report
coverage-report:
	./venv/bin/coverage html; xdg-open htmlcov/index.html
