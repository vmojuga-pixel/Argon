
---
## OVERLORD EPOCH #56 // 2026-10-16T05:00:37.052Z
- Topic: Recursive Descent JSON Parser & Lexer Without Standard Library codec/json
- Services: 1

```javascript
Below is a basic implementation of a recursive descent parser and lexer for JSON in Go without using the standard library's `encoding/json` package. This example handles basic JSON parsing for objects, arrays, strings, numbers, booleans, and null.

First, let's define our lexer:

```go
package main

import (
	"fmt"
	"strings"
)

// TokenType represents the type of token
type TokenType int

const (
	STRING TokenType = iota
	NUMBER
	BOOL
	NULL
	LBRACE
	RBRACE
	LBRACK
	RBRACK
	COLON
	COMMA
	EOF
	ERROR
)

// Token represents a single token in the input stream
type Token struct {
	Type  TokenType
	Value string
}

// Lexer represents the lexer
type Lexer struct {
	Input  string
	Pos    int
	Tokens []*Token
}

// NewLexer returns a new lexer
func NewLexer(input string) *Lexer {
	return &Lexer{Input: input}
}

// NextToken gets the next token from the input stream
func (l *Lexer) NextToken() *Token {
	if l.Pos >= len(l.Input) {
		return &Token{Type: EOF}
	}

	// Skip whitespace
	for l.Pos < len(l.Input) && strings.ContainsRune(" \t\n\r", rune(l.Input[l.Pos])) {
		l.Pos++
	}

	if l.Pos >= len(l.Input) {
		return &Token{Type: EOF}
	}

	switch l.Input[l.Pos] {
	case '{':
		l.Pos++
		return &Token{Type: LBRACE, Value: "{"}
	case '}':
		l.Pos++
		return &Token{Type: RBRACE, Value: "}"}
	case '[':
		l.Pos++
		return &Token{Type: LBRACK, Value: "["}
	case ']':
		l.Pos++
		return &Token{Type: RBRACK, Value: "]"}
	case ':':
		l.Pos++
		return &Token{Type: COLON, Value: ":"}
	case ',':
		l.Pos++
		return &Token{Type: COMMA, Value: ","}
	case '"':
		return l.readString()
	default:
		if isDigit(l.Input[l.Pos]) || l.Input[l.Pos] == '-' {
			return l.readNumber()
		} else if strings.HasPrefix(l.Input[l.Pos:], "null") {
			l.Pos += 4
			return &Token{Type: NULL, Value: "null"}
		} else if strings.HasPrefix(l.Input[l.Pos:], "true") {
			l.Pos += 4
			return &Token{Type: BOOL, Value: "true"}
		} else if strings.HasPrefix(l.Input[l.Pos:], "false") {
			l.Pos += 5
			return &Token{Type: BOOL, Value: "false"}
		}
	}

	return &Token{Type: ERROR}
}

func (l *Lexer) readString() *Token {
	start := l.Pos
	l.Pos++ // Consume the opening quote
	for l.Pos < len(l.Input) && l.Input[l.Pos] != '"' {
		l.Pos++
	}
	if l.Pos >= len(l.Input) || l.Input[l.Pos] != '"' {
		return &Token{Type: ERROR}
	}
	l.Pos++ // Consume the closing quote
	return &Token{Type: STRING, Value: l.Input[start:l.Pos-1]}
}

func (l *Lexer) readNumber() *Token {
	start := l.Pos
	for l.Pos < len(l.Input) && (isDigit(l.Input[l.Pos]) || l.Input[l.Pos] == '.' || l.Input[l.Pos] == '-' || l.Input[l.Pos] == '+' || l.Input[l.Pos] == 'e' || l.Input[l.Pos] == 'E') {
		l.Pos++
	}
	return &Token{Type: NUMBER, Value: l.Input[start:l.Pos]}
}

func isDigit(r byte) bool {
	return r >= '0' && r <= '9'
}
```

And here's a basic recursive descent parser:

```go
// Parser represents the parser
type Parser struct {
	Tokens []*Token
	Pos    int
}

// NewParser returns a new parser
func NewParser(lexer *Lexer) *Parser {
	tokens := []*To
```
