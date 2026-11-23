package game

import (
	"math/rand"
	"slices"
	"time"
)

// Board size in cells; must match the client's MAX_WIDTH / MAX_HEIGHT.
const (
	Width         = 60
	Height        = 40
	StartInterval = 100 * time.Millisecond
)

// Point is a board cell; it marshals to JSON as [x, y].
type Point [2]int

// Direction uses the browser's KeyboardEvent.key names.
type Direction string

const (
	Up    Direction = "ArrowUp"
	Down  Direction = "ArrowDown"
	Left  Direction = "ArrowLeft"
	Right Direction = "ArrowRight"
)

func ParseDirection(s string) (Direction, bool) {
	switch d := Direction(s); d {
	case Up, Down, Left, Right:
		return d, true
	}
	return "", false
}

var opposite = map[Direction]Direction{Up: Down, Down: Up, Left: Right, Right: Left}

type Snake struct {
	ID       int
	Body     []Point // head first
	Dir      Direction
	Interval time.Duration
	NextMove time.Time
	Score    int
}

// Game holds the shared board. It is not safe for concurrent use; the hub goroutine owns it.
type Game struct {
	Snakes  [2]*Snake
	Dot     Point
	Started bool

	rng     *rand.Rand
	tieFlip bool
}

func New(rng *rand.Rand) *Game {
	g := &Game{rng: rng}
	g.spawnDot()
	return g
}

func startSnake(slot int) *Snake {
	if slot == 0 {
		return &Snake{ID: 0, Body: []Point{{10, 10}, {10, 11}, {10, 12}}, Dir: Up, Interval: StartInterval}
	}
	return &Snake{ID: 1, Body: []Point{{49, 29}, {49, 28}, {49, 27}}, Dir: Down, Interval: StartInterval}
}

func (g *Game) AddSnake(slot int, now time.Time) {
	s := startSnake(slot)
	s.NextMove = now.Add(s.Interval)
	g.Snakes[slot] = s

	if !g.Started && g.Snakes[0] != nil && g.Snakes[1] != nil {
		g.Started = true
		for _, sn := range g.Snakes {
			sn.NextMove = now.Add(sn.Interval)
		}
	}
}

func (g *Game) RemoveSnake(slot int) { g.Snakes[slot] = nil }

func (g *Game) Empty() bool { return g.Snakes[0] == nil && g.Snakes[1] == nil }

func (g *Game) SetDirection(slot int, d Direction) {
	s := g.Snakes[slot]
	if s == nil || opposite[s.Dir] == d {
		return
	}
	s.Dir = d
}

// Advance moves every snake that is due at now exactly once and reports
// whether anything moved. When both are due, the processing order
// alternates between calls so neither slot always wins a dot tie.
func (g *Game) Advance(now time.Time) bool {
	if !g.Started {
		return false
	}
	var due []*Snake
	for _, s := range g.Snakes {
		if s != nil && !s.NextMove.After(now) {
			due = append(due, s)
		}
	}
	if len(due) == 2 {
		if g.tieFlip {
			due[0], due[1] = due[1], due[0]
		}
		g.tieFlip = !g.tieFlip
	}
	for _, s := range due {
		g.move(s)
		s.NextMove = s.NextMove.Add(s.Interval)
		if s.NextMove.Before(now) {
			s.NextMove = now
		}
	}
	return len(due) > 0
}

func (g *Game) move(s *Snake) {
	h := step(s.Body[0], s.Dir)
	s.Body = append([]Point{h}, s.Body...)
	if h == g.Dot {
		s.Score++
		s.Interval = nextInterval(s.Interval)
		g.spawnDot()
		return
	}
	s.Body = s.Body[:len(s.Body)-1]
}

func (g *Game) NextDue() (time.Time, bool) {
	var next time.Time
	found := false
	if !g.Started {
		return next, false
	}
	for _, s := range g.Snakes {
		if s != nil && (!found || s.NextMove.Before(next)) {
			next, found = s.NextMove, true
		}
	}
	return next, found
}

func (g *Game) spawnDot() {
	for {
		p := Point{g.rng.Intn(Width), g.rng.Intn(Height)}
		if !g.occupied(p) {
			g.Dot = p
			return
		}
	}
}

func (g *Game) occupied(p Point) bool {
	for _, s := range g.Snakes {
		if s != nil && slices.Contains(s.Body, p) {
			return true
		}
	}
	return false
}

func step(p Point, d Direction) Point {
	x, y := p[0], p[1]
	switch d {
	case Up:
		y = (y - 1 + Height) % Height
	case Down:
		y = (y + 1) % Height
	case Left:
		x = (x - 1 + Width) % Width
	case Right:
		x = (x + 1) % Width
	}
	return Point{x, y}
}

// nextInterval mirrors the single-player speed-up in game.ts.
func nextInterval(d time.Duration) time.Duration {
	switch {
	case d > 40*time.Millisecond:
		return d - 2*time.Millisecond
	case d > 20*time.Millisecond:
		return d - time.Millisecond
	}
	return d
}

type SnakeView struct {
	ID    int     `json:"id"`
	Body  []Point `json:"body"`
	Score int     `json:"score"`
}

type StateMsg struct {
	Type    string        `json:"type"`
	Started bool          `json:"started"`
	Dot     Point         `json:"dot"`
	Snakes  [2]*SnakeView `json:"snakes"`
}

func (g *Game) State() StateMsg {
	m := StateMsg{Type: "state", Started: g.Started, Dot: g.Dot}
	for i, s := range g.Snakes {
		if s != nil {
			m.Snakes[i] = &SnakeView{ID: s.ID, Body: append([]Point(nil), s.Body...), Score: s.Score}
		}
	}
	return m
}
