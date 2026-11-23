package main

import (
	"context"
	"flag"
	"log"
	"math/rand"
	"net/http"
	"time"

	"github.com/vovchenso/snake_it/server/internal/hub"
)

func main() {
	addr := flag.String("addr", ":8080", "listen address")
	static := flag.String("static", "../client", "directory with the client files")
	flag.Parse()

	h := hub.New(rand.New(rand.NewSource(time.Now().UnixNano())))
	go h.Run(context.Background())

	log.Printf("listening on %s", *addr)
	log.Fatal(http.ListenAndServe(*addr, hub.NewServer(h, *static)))
}
