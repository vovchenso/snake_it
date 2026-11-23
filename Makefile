CLIENT := client
SERVER := server

.PHONY: all install build typecheck test run clean

all: build

# Reinstall only when the dependency list changes.
$(CLIENT)/node_modules: $(CLIENT)/package.json $(CLIENT)/package-lock.json
	cd $(CLIENT) && npm install
	@touch $@

install: $(CLIENT)/node_modules

## build: bundle the client into client/dist/main.js
build: install
	cd $(CLIENT) && npm run build

## typecheck: strict TypeScript check of the client
typecheck: install
	cd $(CLIENT) && npm run typecheck

## test: client typecheck + server vet and tests
test: typecheck
	cd $(SERVER) && go vet ./... && go test ./...

## run: build the client and start the server on :8080 (pass flags via ARGS="-addr :9000")
run: build
	cd $(SERVER) && go run . $(ARGS)

## clean: remove the client bundle
clean:
	rm -rf $(CLIENT)/dist
