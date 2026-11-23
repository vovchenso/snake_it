package main

import (
	"context"
	"flag"
	"log"
	"math/rand"
	"net/http"
	"time"
)

func main() {
	addr := flag.String("addr", ":8080", "listen address")
	static := flag.String("static", "../client", "directory with the client files")
	flag.Parse()

	hub := NewHub(rand.New(rand.NewSource(time.Now().UnixNano())))
	go hub.Run(context.Background())

	log.Printf("listening on %s", *addr)
	log.Fatal(http.ListenAndServe(*addr, NewServer(hub, *static)))
}
