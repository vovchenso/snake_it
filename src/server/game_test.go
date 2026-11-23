package main

import (
	"encoding/json"
	"math/rand"
	"reflect"
	"strings"
	"testing"
	"time"
)

var t0 = time.Unix(0, 0)

func newTestGame() *Game {
	return NewGame(rand.New(rand.NewSource(1)))
}

func head(s *Snake) Point { return s.Body[0] }

func TestStepWraps(t *testing.T) {
	cases := []struct {
		p    Point
		d    Direction
		want Point
	}{
		{Point{10, 0}, Up, Point{10, 39}},
		{Point{10, 39}, Down, Point{10, 0}},
		{Point{0, 5}, Left, Point{59, 5}},
		{Point{59, 5}, Right, Point{0, 5}},
		{Point{10, 10}, Up, Point{10, 9}},
	}
	for _, c := range cases {
		if got := step(c.p, c.d); got != c.want {
			t.Errorf("step(%v, %s) = %v, want %v", c.p, c.d, got, c.want)
		}
	}
}

func TestNextIntervalSteps(t *testing.T) {
	ms := time.Millisecond
	cases := map[time.Duration]time.Duration{
		100 * ms: 98 * ms,
		42 * ms:  40 * ms,
		40 * ms:  39 * ms,
		21 * ms:  20 * ms,
		20 * ms:  20 * ms,
	}
	for in, want := range cases {
		if got := nextInterval(in); got != want {
			t.Errorf("nextInterval(%v) = %v, want %v", in, got, want)
		}
	}
}

func TestParseDirection(t *testing.T) {
	for _, s := range []string{"ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"} {
		if d, ok := ParseDirection(s); !ok || string(d) != s {
			t.Errorf("ParseDirection(%q) = %q, %v", s, d, ok)
		}
	}
	for _, s := range []string{"", "KeyW", "arrowup"} {
		if _, ok := ParseDirection(s); ok {
			t.Errorf("ParseDirection(%q) accepted", s)
		}
	}
}

func TestStartPositionsAndStart(t *testing.T) {
	g := newTestGame()
	g.AddSnake(0, t0)
	s0 := g.Snakes[0]
	if !reflect.DeepEqual(s0.Body, []Point{{10, 10}, {10, 11}, {10, 12}}) || s0.Dir != Up || s0.Interval != StartInterval {
		t.Fatalf("snake 0 = %+v", s0)
	}
	if g.Started {
		t.Fatal("started with one player")
	}
	if g.Advance(t0.Add(time.Second)) {
		t.Fatal("advanced before start")
	}
	if _, ok := g.NextDue(); ok {
		t.Fatal("NextDue ok before start")
	}

	g.AddSnake(1, t0)
	s1 := g.Snakes[1]
	if !reflect.DeepEqual(s1.Body, []Point{{49, 29}, {49, 28}, {49, 27}}) || s1.Dir != Down {
		t.Fatalf("snake 1 = %+v", s1)
	}
	if !g.Started {
		t.Fatal("not started with two players")
	}
	if due, ok := g.NextDue(); !ok || !due.Equal(t0.Add(100*time.Millisecond)) {
		t.Fatalf("NextDue = %v, %v", due, ok)
	}
}

func startedGame() *Game {
	g := newTestGame()
	g.AddSnake(0, t0)
	g.AddSnake(1, t0)
	g.Dot = Point{0, 0}
	return g
}

func TestAdvanceMovesOnlyDueSnakes(t *testing.T) {
	g := startedGame()
	g.Snakes[1].Interval = 50 * time.Millisecond
	g.Snakes[1].NextMove = t0.Add(50 * time.Millisecond)

	if !g.Advance(t0.Add(50 * time.Millisecond)) {
		t.Fatal("nothing moved")
	}
	if head(g.Snakes[1]) != (Point{49, 30}) || head(g.Snakes[0]) != (Point{10, 10}) {
		t.Fatalf("heads = %v %v", head(g.Snakes[0]), head(g.Snakes[1]))
	}
	g.Advance(t0.Add(100 * time.Millisecond))
	if head(g.Snakes[0]) != (Point{10, 9}) {
		t.Fatalf("snake 0 head = %v", head(g.Snakes[0]))
	}
	if len(g.Snakes[0].Body) != 3 || len(g.Snakes[1].Body) != 3 {
		t.Fatal("snakes grew without eating")
	}
}

func TestAdvanceNoCatchUpBurst(t *testing.T) {
	g := startedGame()
	late := t0.Add(time.Second)
	g.Advance(late)
	if head(g.Snakes[0]) != (Point{10, 9}) {
		t.Fatalf("snake 0 moved more than once: %v", head(g.Snakes[0]))
	}
	if g.Snakes[0].NextMove.Before(late) {
		t.Fatalf("NextMove %v is in the past", g.Snakes[0].NextMove)
	}
}

func TestReversalBlocked(t *testing.T) {
	g := newTestGame()
	g.AddSnake(0, t0)
	g.SetDirection(0, Down)
	if g.Snakes[0].Dir != Up {
		t.Fatal("reversal allowed")
	}
	g.SetDirection(0, Left)
	if g.Snakes[0].Dir != Left {
		t.Fatal("turn not applied")
	}
	g.SetDirection(1, Up) // empty slot: must not panic
}

func TestEatGrowsScoresSpeedsUpAndRespawns(t *testing.T) {
	g := startedGame()
	g.Dot = Point{10, 9}
	g.Advance(t0.Add(100 * time.Millisecond))

	s0, s1 := g.Snakes[0], g.Snakes[1]
	if len(s0.Body) != 4 || s0.Score != 1 || s0.Interval != 98*time.Millisecond {
		t.Fatalf("eater = %+v", s0)
	}
	if len(s1.Body) != 3 || s1.Score != 0 || s1.Interval != 100*time.Millisecond {
		t.Fatalf("other = %+v", s1)
	}
	if g.Dot == (Point{10, 9}) || onAnyBody(g, g.Dot) {
		t.Fatalf("dot respawned badly at %v", g.Dot)
	}
}

func onAnyBody(g *Game, p Point) bool {
	for _, s := range g.Snakes {
		if s == nil {
			continue
		}
		for _, b := range s.Body {
			if b == p {
				return true
			}
		}
	}
	return false
}

func TestDotNeverOnBody(t *testing.T) {
	g := newTestGame()
	g.AddSnake(0, t0)
	body := make([]Point, 0, Width*Height)
	for x := 0; x < Width; x++ {
		for y := 0; y < Height; y++ {
			if x != 5 || y != 5 {
				body = append(body, Point{x, y})
			}
		}
	}
	g.Snakes[0].Body = body
	for i := 0; i < 20; i++ {
		g.spawnDot()
		if g.Dot != (Point{5, 5}) {
			t.Fatalf("dot at %v", g.Dot)
		}
	}
}

func setupTie(g *Game, at time.Time) {
	g.Snakes[0].Body = []Point{{20, 21}, {20, 22}, {20, 23}}
	g.Snakes[0].Dir = Up
	g.Snakes[1].Body = []Point{{20, 19}, {20, 18}, {20, 17}}
	g.Snakes[1].Dir = Down
	for _, s := range g.Snakes {
		s.Score = 0
		s.NextMove = at
	}
	g.Dot = Point{20, 20}
}

func tieWinner(t *testing.T, g *Game) int {
	t.Helper()
	switch {
	case g.Snakes[0].Score == 1 && g.Snakes[1].Score == 0:
		return 0
	case g.Snakes[1].Score == 1 && g.Snakes[0].Score == 0:
		return 1
	}
	t.Fatalf("scores = %d, %d", g.Snakes[0].Score, g.Snakes[1].Score)
	return -1
}

func TestTieAlternates(t *testing.T) {
	g := startedGame()
	at := t0.Add(time.Second)
	setupTie(g, at)
	g.Advance(at)
	w1 := tieWinner(t, g)

	at2 := at.Add(time.Second)
	setupTie(g, at2)
	g.Advance(at2)
	if w2 := tieWinner(t, g); w2 == w1 {
		t.Fatalf("slot %d won both ties", w1)
	}
}

func TestJoinMidGameKeepsExisting(t *testing.T) {
	g := startedGame()
	g.Dot = Point{10, 9}
	g.Advance(t0.Add(100 * time.Millisecond))
	g.RemoveSnake(1)
	if !g.Started || g.Snakes[1] != nil || g.Empty() {
		t.Fatal("bad state after one player left")
	}

	now := t0.Add(200 * time.Millisecond)
	if !g.Advance(now) {
		t.Fatal("remaining snake did not move alone")
	}
	g.AddSnake(1, now)
	s0, s1 := g.Snakes[0], g.Snakes[1]
	if s0.Score != 1 || s0.Interval != 98*time.Millisecond || len(s0.Body) != 4 {
		t.Fatalf("existing snake changed: %+v", s0)
	}
	if s1.Score != 0 || s1.Interval != StartInterval || head(s1) != (Point{49, 29}) {
		t.Fatalf("newcomer not fresh: %+v", s1)
	}
	if !s1.NextMove.Equal(now.Add(StartInterval)) {
		t.Fatalf("newcomer NextMove = %v", s1.NextMove)
	}

	g.RemoveSnake(0)
	g.RemoveSnake(1)
	if !g.Empty() {
		t.Fatal("not empty")
	}
}

func TestStateJSON(t *testing.T) {
	g := newTestGame()
	g.AddSnake(0, t0)
	b, err := json.Marshal(g.State())
	if err != nil {
		t.Fatal(err)
	}
	s := string(b)
	for _, want := range []string{
		`"type":"state"`,
		`"started":false`,
		`"snakes":[{"id":0,"body":[[10,10],[10,11],[10,12]],"score":0},null]`,
	} {
		if !strings.Contains(s, want) {
			t.Errorf("%s missing %s", s, want)
		}
	}
}
