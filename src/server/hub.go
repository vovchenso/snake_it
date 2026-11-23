package main

import (
	"context"
	"encoding/json"
	"log"
	"math/rand"
	"time"
)

const sendBuffer = 16

// Client is one connected player as seen by the hub. The hub closes send
// when the client leaves or is dropped.
type Client struct {
	send chan []byte
	slot int
}

func NewClient() *Client { 
	return &Client{
		send: make(chan []byte, sendBuffer), 
		slot: -1,
	} 
}

type joinReq struct {
	c     *Client
	reply chan bool
}

type inputReq struct {
	c *Client
	d Direction
}

// Hub owns the Game; Run is the only goroutine that touches it.
type Hub struct {
	rng     *rand.Rand
	game    *Game
	clients [2]*Client

	join  chan joinReq
	leave chan *Client
	input chan inputReq
}

func NewHub(rng *rand.Rand) *Hub {
	return &Hub{
		rng:   rng,
		game:  NewGame(rng),
		join:  make(chan joinReq),
		leave: make(chan *Client),
		input: make(chan inputReq, 64),
	}
}

// Join blocks until the hub assigns c a slot. It returns false if the game
// is full. On success, welcome and the current state are already queued.
func (h *Hub) Join(c *Client) bool {
	reply := make(chan bool, 1)
	h.join <- joinReq{c, reply}
	return <-reply
}

func (h *Hub) Leave(c *Client) { h.leave <- c }

func (h *Hub) Input(c *Client, d Direction) { h.input <- inputReq{c, d} }

func (h *Hub) Run(ctx context.Context) {
	timer := time.NewTimer(time.Hour)
	timer.Stop()

	for {
		changed := false
		select {
		case <-ctx.Done():
			return
		case r := <-h.join:
			ok := h.addClient(r.c)
			r.reply <- ok
			changed = ok
		case c := <-h.leave:
			changed = h.removeClient(c)
		case in := <-h.input:
			if h.clients[in.c.slot] == in.c {
				h.game.SetDirection(in.c.slot, in.d)
			}
		case <-timer.C:
			changed = h.game.Advance(time.Now())
		}
		if changed {
			h.broadcast()
		}

		timer.Stop()
		if due, ok := h.game.NextDue(); ok {
			timer.Reset(time.Until(due))
		}
	}
}

func (h *Hub) addClient(c *Client) bool {
	for slot, existing := range h.clients {
		if existing != nil {
			continue
		}
		c.slot = slot
		h.clients[slot] = c
		h.game.AddSnake(slot, time.Now())
		welcome, _ := json.Marshal(map[string]any{"type": "welcome", "you": slot, "width": Width, "height": Height})
		c.send <- welcome // fresh buffered channel: never blocks
		return true
	}
	return false
}

// removeClient is idempotent: a client already dropped is ignored.
func (h *Hub) removeClient(c *Client) bool {
	if c.slot < 0 || h.clients[c.slot] != c {
		return false
	}
	h.clients[c.slot] = nil
	h.game.RemoveSnake(c.slot)
	close(c.send)
	if h.game.Empty() {
		h.game = NewGame(h.rng)
	}
	return true
}

func (h *Hub) broadcast() {
	b, err := json.Marshal(h.game.State())
	if err != nil {
		log.Printf("marshal state: %v", err)
		return
	}
	dropped := false
	for _, c := range h.clients {
		if c == nil {
			continue
		}
		select {
		case c.send <- b:
		default:
			log.Printf("dropping slow client in slot %d", c.slot)
			h.removeClient(c)
			dropped = true
		}
	}
	if dropped {
		h.broadcast()
	}
}
