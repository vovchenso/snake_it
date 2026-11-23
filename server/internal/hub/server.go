package hub

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/coder/websocket"

	"github.com/vovchenso/snake_it/server/internal/game"
)

// Peers that don't answer a ping within pingTimeout are disconnected, so a
// vanished player frees their slot.
const (
	pingInterval = 5 * time.Second
	pingTimeout  = 5 * time.Second
)

// NewServer serves the WebSocket game at /ws and the client files at /.
func NewServer(h *Hub, staticDir string) http.Handler {
	return newServer(h, staticDir, pingInterval, pingTimeout)
}

func newServer(h *Hub, staticDir string, interval, timeout time.Duration) http.Handler {
	mux := http.NewServeMux()
	mux.Handle("/", http.FileServer(http.Dir(staticDir)))
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) { serveWS(h, w, r, interval, timeout) })
	return mux
}

type clientMsg struct {
	Type string `json:"type"`
	Dir  string `json:"dir"`
}

func serveWS(h *Hub, w http.ResponseWriter, r *http.Request, pingEvery, pingTimeout time.Duration) {
	// Any origin: pages opened from file:// send "Origin: null".
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{InsecureSkipVerify: true})
	if err != nil {
		log.Printf("accept: %v", err)
		return
	}

	c := NewClient()
	if !h.Join(c) {
		ctx, cancel := context.WithTimeout(r.Context(), time.Second)
		defer cancel()
		_ = conn.Write(ctx, websocket.MessageText, []byte(`{"type":"full"}`))
		conn.Close(websocket.StatusPolicyViolation, "full")
		return
	}

	go writeLoop(conn, c)

	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()
	go pingLoop(ctx, conn, pingEvery, pingTimeout)

	for {
		_, b, err := conn.Read(ctx)
		if err != nil {
			break
		}
		var m clientMsg
		if json.Unmarshal(b, &m) != nil || m.Type != "dir" {
			continue
		}
		if d, ok := game.ParseDirection(m.Dir); ok {
			h.Input(c, d)
		}
	}
	h.Leave(c)
}

// writeLoop forwards hub messages until the hub closes c.send.
func writeLoop(conn *websocket.Conn, c *Client) {
	for b := range c.send {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		err := conn.Write(ctx, websocket.MessageText, b)
		cancel()
		if err != nil {
			break
		}
	}
	conn.CloseNow()
	for range c.send { // drain until the hub closes it
	}
}

// pingLoop closes the connection when the peer stops answering pings; the
// read loop then fails and the hub frees the slot. Ping needs the
// concurrent Read in serveWS to receive the pong.
func pingLoop(ctx context.Context, conn *websocket.Conn, every, timeout time.Duration) {
	t := time.NewTicker(every)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			pctx, cancel := context.WithTimeout(ctx, timeout)
			err := conn.Ping(pctx)
			cancel()
			if err != nil {
				if ctx.Err() == nil {
					log.Printf("ping failed, dropping peer: %v", err)
				}
				conn.CloseNow()
				return
			}
		}
	}
}
