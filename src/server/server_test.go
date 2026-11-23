package main

import (
	"context"
	"encoding/json"
	"math/rand"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/coder/websocket"
)

func startServer(t *testing.T) *httptest.Server {
	t.Helper()
	ctx, cancel := context.WithCancel(context.Background())
	hub := NewHub(rand.New(rand.NewSource(1)))
	go hub.Run(ctx)
	srv := httptest.NewServer(NewServer(hub, t.TempDir()))
	t.Cleanup(func() { srv.Close(); cancel() })
	return srv
}

func dial(t *testing.T, srv *httptest.Server) *websocket.Conn {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	url := "ws" + strings.TrimPrefix(srv.URL, "http") + "/ws"
	c, _, err := websocket.Dial(ctx, url, nil)
	if err != nil {
		t.Fatalf("dial: %v", err)
	}
	t.Cleanup(func() { c.CloseNow() })
	return c
}

type msg map[string]any

func readMsg(t *testing.T, c *websocket.Conn) msg {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	_, b, err := c.Read(ctx)
	if err != nil {
		t.Fatalf("read: %v", err)
	}
	var m msg
	if err := json.Unmarshal(b, &m); err != nil {
		t.Fatalf("bad json %s: %v", b, err)
	}
	return m
}

func readUntil(t *testing.T, c *websocket.Conn, pred func(msg) bool) msg {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		if m := readMsg(t, c); pred(m) {
			return m
		}
	}
	t.Fatal("condition not met in time")
	return nil
}

func write(t *testing.T, c *websocket.Conn, s string) {
	t.Helper()
	ctx, cancel := context.WithTimeout(context.Background(), time.Second)
	defer cancel()
	if err := c.Write(ctx, websocket.MessageText, []byte(s)); err != nil {
		t.Fatalf("write: %v", err)
	}
}

// snake returns state.snakes[i] or nil.
func snake(m msg, i int) map[string]any {
	s, _ := m["snakes"].([]any)[i].(map[string]any)
	return s
}

func headOf(m msg, i int) [2]float64 {
	h := snake(m, i)["body"].([]any)[0].([]any)
	return [2]float64{h[0].(float64), h[1].(float64)}
}

func isState(m msg) bool { return m["type"] == "state" }

func started(m msg) bool { return isState(m) && m["started"] == true }

func TestJoinFullAndWelcome(t *testing.T) {
	srv := startServer(t)

	c1 := dial(t, srv)
	w := readMsg(t, c1)
	if w["type"] != "welcome" || w["you"] != 0.0 || w["width"] != 60.0 || w["height"] != 40.0 {
		t.Fatalf("welcome = %v", w)
	}
	if s := readMsg(t, c1); !isState(s) || s["started"] != false {
		t.Fatalf("first state = %v", s)
	}

	c2 := dial(t, srv)
	if w := readMsg(t, c2); w["type"] != "welcome" || w["you"] != 1.0 {
		t.Fatalf("welcome 2 = %v", w)
	}
	readUntil(t, c1, started)
	readUntil(t, c2, started)

	c3 := dial(t, srv)
	if f := readMsg(t, c3); f["type"] != "full" {
		t.Fatalf("third got %v", f)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()
	if _, _, err := c3.Read(ctx); err == nil {
		t.Fatal("third connection not closed")
	}
}

func joinTwo(t *testing.T, srv *httptest.Server) (*websocket.Conn, *websocket.Conn) {
	t.Helper()
	c1 := dial(t, srv)
	readMsg(t, c1)
	c2 := dial(t, srv)
	readMsg(t, c2)
	return c1, c2
}

func TestDirChangesState(t *testing.T) {
	srv := startServer(t)
	c1, _ := joinTwo(t, srv)
	write(t, c1, `{"type":"dir","dir":"ArrowLeft"}`)
	readUntil(t, c1, func(m msg) bool { return started(m) && headOf(m, 0)[0] == 9 })
}

func TestBadMessagesIgnored(t *testing.T) {
	srv := startServer(t)
	c1 := dial(t, srv)
	readMsg(t, c1)
	write(t, c1, `not json`)
	write(t, c1, `{"type":"dir","dir":"KeyW"}`)
	write(t, c1, `{"type":"other"}`)
	c2 := dial(t, srv)
	readMsg(t, c2)

	// Still connected, still heading Up: head y goes 10 -> 9 -> 8.
	readUntil(t, c1, func(m msg) bool { return started(m) && headOf(m, 0) == [2]float64{10, 8} })
}

func TestLeaveFreesSlot(t *testing.T) {
	srv := startServer(t)
	c1, c2 := joinTwo(t, srv)
	c2.Close(websocket.StatusNormalClosure, "")
	readUntil(t, c1, func(m msg) bool { return started(m) && snake(m, 1) == nil })

	c3 := dial(t, srv)
	if w := readMsg(t, c3); w["you"] != 1.0 {
		t.Fatalf("welcome = %v", w)
	}
	s := readUntil(t, c3, isState)
	if snake(s, 1)["score"] != 0.0 || headOf(s, 1) != [2]float64{49, 29} {
		t.Fatalf("newcomer state = %v", s)
	}
}

func TestEmptyGameResets(t *testing.T) {
	srv := startServer(t)
	c1, c2 := joinTwo(t, srv)
	readUntil(t, c1, func(m msg) bool { return started(m) && headOf(m, 0)[1] <= 8 })
	c1.Close(websocket.StatusNormalClosure, "")
	c2.Close(websocket.StatusNormalClosure, "")

	// The hub processes the leaves asynchronously; retry until we get slot 0.
	deadline := time.Now().Add(2 * time.Second)
	for time.Now().Before(deadline) {
		c := dial(t, srv)
		if w := readMsg(t, c); w["type"] == "welcome" && w["you"] == 0.0 {
			s := readMsg(t, c)
			if s["started"] == false && snake(s, 1) == nil {
				if snake(s, 0)["score"] != 0.0 || headOf(s, 0) != [2]float64{10, 10} {
					t.Fatalf("not a fresh game: %v", s)
				}
				return
			}
			// the other player's leave is still in flight: retry
		}
		c.CloseNow()
		time.Sleep(20 * time.Millisecond)
	}
	t.Fatal("never got slot 0 on a fresh game")
}

func TestSlowClientDropped(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()
	hub := NewHub(rand.New(rand.NewSource(1)))
	go hub.Run(ctx)

	slow := NewClient()
	if !hub.Join(slow) {
		t.Fatal("slow join failed")
	}
	fast := NewClient()
	if !hub.Join(fast) {
		t.Fatal("fast join failed")
	}
	got := make(chan struct{}, 1024)
	go func() {
		for range fast.send {
			got <- struct{}{}
		}
	}()

	// ~1 broadcast per 100 ms; the slow buffer (16) overflows after ~1.7 s.
	time.Sleep(2500 * time.Millisecond)
	for len(got) > 0 {
		<-got
	}
	select {
	case <-got:
	case <-time.After(time.Second):
		t.Fatal("fast client stopped receiving")
	}

	closed := false
	timeout := time.After(time.Second)
	for !closed {
		select {
		case _, ok := <-slow.send:
			closed = !ok
		case <-timeout:
			t.Fatal("slow client was not dropped")
		}
	}
}

// A peer that completed the upgrade but never reads (so never answers
// pings) must lose its slot, so the other player and newcomers aren't stuck.
func TestDeadPeerDropped(t *testing.T) {
	ctx, cancel := context.WithCancel(context.Background())
	hub := NewHub(rand.New(rand.NewSource(1)))
	go hub.Run(ctx)
	srv := httptest.NewServer(newServer(hub, t.TempDir(), 50*time.Millisecond, 200*time.Millisecond))
	t.Cleanup(func() { srv.Close(); cancel() })

	dial(t, srv) // dead: never reads
	c2 := dial(t, srv)
	if w := readMsg(t, c2); w["you"] != 1.0 {
		t.Fatalf("welcome = %v", w)
	}
	readUntil(t, c2, func(m msg) bool { return isState(m) && snake(m, 0) == nil })
}
