package main

import (
	"bufio"
	"bytes"
	"encoding/binary"
	"errors"
	"fmt"
	"io"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"
)

// ============================================================================
// 1. DNS RESOLVER (RFC 1035 Raw Binary UDP Packet Builder & Parser)
// ============================================================================
type DNSHeader struct {
	ID      uint16
	Flags   uint16
	QDCount uint16
	ANCount uint16
	NSCount uint16
	ARCount uint16
}

func ResolveDNS(domain string, dnsServer string) ([]string, error) {
	conn, err := net.DialTimeout("udp", dnsServer, 3*time.Second)
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	_ = conn.SetDeadline(time.Now().Add(3 * time.Second))

	var buf bytes.Buffer
	header := DNSHeader{ID: 0xAAAA, Flags: 0x0100, QDCount: 1}
	_ = binary.Write(&buf, binary.BigEndian, header)

	for _, part := range strings.Split(domain, ".") {
		buf.WriteByte(byte(len(part)))
		buf.WriteString(part)
	}
	buf.WriteByte(0x00)

	_ = binary.Write(&buf, binary.BigEndian, uint16(1))
	_ = binary.Write(&buf, binary.BigEndian, uint16(1))

	if _, err := conn.Write(buf.Bytes()); err != nil {
		return nil, err
	}

	resp := make([]byte, 512)
	n, err := conn.Read(resp)
	if err != nil {
		return nil, err
	}
	if n < 12 {
		return nil, errors.New("invalid DNS packet size")
	}

	anCount := binary.BigEndian.Uint16(resp[6:8])
	offset := 12

	for offset < n && resp[offset] != 0 {
		offset += int(resp[offset]) + 1
	}
	offset += 5

	var ips []string
	for i := 0; i < int(anCount) && offset < n; i++ {
		if (resp[offset] & 0xC0) == 0xC0 {
			offset += 2
		} else {
			for offset < n && resp[offset] != 0 {
				offset += int(resp[offset]) + 1
			}
			offset++
		}
		if offset+10 > n {
			break
		}
		rType := binary.BigEndian.Uint16(resp[offset : offset+2])
		rdLength := binary.BigEndian.Uint16(resp[offset+8 : offset+10])
		offset += 10

		if rType == 1 && rdLength == 4 && offset+4 <= n {
			ip := net.IPv4(resp[offset], resp[offset+1], resp[offset+2], resp[offset+3])
			ips = append(ips, ip.String())
		}
		offset += int(rdLength)
	}
	return ips, nil
}

// ============================================================================
// 2. REDIS SERVER (RESP Protocol TCP Engine)
// ============================================================================
type RESPServer struct {
	mu    sync.RWMutex
	store map[string]string
}

func NewRESPServer() *RESPServer {
	return &RESPServer{store: make(map[string]string)}
}

func (s *RESPServer) ListenAndServe(addr string) error {
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	for {
		conn, err := ln.Accept()
		if err != nil {
			continue
		}
		go s.handleClient(conn)
	}
}

func (s *RESPServer) handleClient(conn net.Conn) {
	defer conn.Close()
	reader := bufio.NewReader(conn)
	for {
		args, err := parseRESPArray(reader)
		if err != nil {
			if err != io.EOF {
				_, _ = conn.Write([]byte("-ERR " + err.Error() + "\r\n"))
			}
			return
		}
		if len(args) == 0 {
			continue
		}
		cmd := strings.ToUpper(args[0])
		switch cmd {
		case "PING":
			_, _ = conn.Write([]byte("+PONG\r\n"))
		case "SET":
			if len(args) < 3 {
				_, _ = conn.Write([]byte("-ERR wrong number of arguments for 'SET'\r\n"))
				continue
			}
			s.mu.Lock()
			s.store[args[1]] = args[2]
			s.mu.Unlock()
			_, _ = conn.Write([]byte("+OK\r\n"))
		case "GET":
			if len(args) < 2 {
				_, _ = conn.Write([]byte("-ERR wrong number of arguments for 'GET'\r\n"))
				continue
			}
			s.mu.RLock()
			val, ok := s.store[args[1]]
			s.mu.RUnlock()
			if !ok {
				_, _ = conn.Write([]byte("$-1\r\n"))
			} else {
				_, _ = fmt.Fprintf(conn, "$%d\r\n%s\r\n", len(val), val)
			}
		default:
			_, _ = conn.Write([]byte("-ERR unknown command\r\n"))
		}
	}
}

func parseRESPArray(r *bufio.Reader) ([]string, error) {
	line, err := r.ReadString('\n')
	if err != nil {
		return nil, err
	}
	line = strings.TrimSuffix(line, "\r\n")
	if len(line) == 0 || line[0] != '*' {
		return nil, errors.New("expected RESP array (*)")
	}
	count, err := strconv.Atoi(line[1:])
	if err != nil {
		return nil, err
	}
	res := make([]string, 0, count)
	for i := 0; i < count; i++ {
		bulkHeader, err := r.ReadString('\n')
		if err != nil {
			return nil, err
		}
		bulkHeader = strings.TrimSuffix(bulkHeader, "\r\n")
		if len(bulkHeader) == 0 || bulkHeader[0] != '$' {
			return nil, errors.New("expected RESP bulk string ($)")
		}
		strLen, err := strconv.Atoi(bulkHeader[1:])
		if err != nil {
			return nil, err
		}
		buf := make([]byte, strLen+2)
		if _, err := io.ReadFull(r, buf); err != nil {
			return nil, err
		}
		res = append(res, string(buf[:strLen]))
	}
	return res, nil
}

// ============================================================================
// 3. JSON PARSER (Recursive Descent Lexer/Tokenizer from scratch)
// ============================================================================
type JSONParser struct {
	input string
	pos   int
}

func ParseJSONFromScratch(raw string) (any, error) {
	p := &JSONParser{input: raw, pos: 0}
	p.skipWhitespace()
	val, err := p.parseValue()
	if err != nil {
		return nil, err
	}
	p.skipWhitespace()
	if p.pos < len(p.input) {
		return nil, errors.New("extra characters after JSON end")
	}
	return val, nil
}

func (p *JSONParser) skipWhitespace() {
	for p.pos < len(p.input) && (p.input[p.pos] == ' ' || p.input[p.pos] == '\n' || p.input[p.pos] == '\t' || p.input[p.pos] == '\r') {
		p.pos++
	}
}

func (p *JSONParser) parseValue() (any, error) {
	p.skipWhitespace()
	if p.pos >= len(p.input) {
		return nil, errors.New("unexpected JSON end")
	}
	ch := p.input[p.pos]
	switch {
	case ch == '{':
		return p.parseObject()
	case ch == '[':
		return p.parseArray()
	case ch == '"':
		return p.parseString()
	case ch == 't' && strings.HasPrefix(p.input[p.pos:], "true"):
		p.pos += 4
		return true, nil
	case ch == 'f' && strings.HasPrefix(p.input[p.pos:], "false"):
		p.pos += 5
		return false, nil
	case ch == 'n' && strings.HasPrefix(p.input[p.pos:], "null"):
		p.pos += 4
		return nil, nil
	case (ch >= '0' && ch <= '9') || ch == '-':
		return p.parseNumber()
	default:
		return nil, fmt.Errorf("invalid char '%c' at position %d", ch, p.pos)
	}
}

func (p *JSONParser) parseObject() (map[string]any, error) {
	obj := make(map[string]any)
	p.pos++
	p.skipWhitespace()
	if p.pos < len(p.input) && p.input[p.pos] == '}' {
		p.pos++
		return obj, nil
	}
	for {
		p.skipWhitespace()
		key, err := p.parseString()
		if err != nil {
			return nil, err
		}
		p.skipWhitespace()
		if p.pos >= len(p.input) || p.input[p.pos] != ':' {
			return nil, errors.New("expected ':' after object key")
		}
		p.pos++
		val, err := p.parseValue()
		if err != nil {
			return nil, err
		}
		obj[key] = val
		p.skipWhitespace()
		if p.pos < len(p.input) && p.input[p.pos] == '}' {
			p.pos++
			return obj, nil
		}
		if p.pos >= len(p.input) || p.input[p.pos] != ',' {
			return nil, errors.New("expected ',' or '}' in object")
		}
		p.pos++
	}
}

func (p *JSONParser) parseArray() ([]any, error) {
	var arr []any
	p.pos++
	p.skipWhitespace()
	if p.pos < len(p.input) && p.input[p.pos] == ']' {
		p.pos++
		return arr, nil
	}
	for {
		val, err := p.parseValue()
		if err != nil {
			return nil, err
		}
		arr = append(arr, val)
		p.skipWhitespace()
		if p.pos < len(p.input) && p.input[p.pos] == ']' {
			p.pos++
			return arr, nil
		}
		if p.pos >= len(p.input) || p.input[p.pos] != ',' {
			return nil, errors.New("expected ',' or ']' in array")
		}
		p.pos++
	}
}

func (p *JSONParser) parseString() (string, error) {
	if p.input[p.pos] != '"' {
		return "", errors.New("string must start with '\"'")
	}
	p.pos++
	start := p.pos
	for p.pos < len(p.input) {
		if p.input[p.pos] == '"' && p.input[p.pos-1] != '\\' {
			res := p.input[start:p.pos]
			p.pos++
			return res, nil
		}
		p.pos++
	}
	return "", errors.New("unterminated string")
}

func (p *JSONParser) parseNumber() (float64, error) {
	start := p.pos
	if p.input[p.pos] == '-' {
		p.pos++
	}
	for p.pos < len(p.input) && ((p.input[p.pos] >= '0' && p.input[p.pos] <= '9') || p.input[p.pos] == '.') {
		p.pos++
	}
	return strconv.ParseFloat(p.input[start:p.pos], 64)
}
