package main

import (
	"context"
	"database/sql"
	"fmt"
	"hash/crc32"
	"sort"
	"sync"
	"sync/atomic"
)

// ============================================================================
// 1. DATABASE SHARDING: Consistent Hashing Ring with Virtual Nodes
// ============================================================================
type ConsistentHashShardManager struct {
	mu       sync.RWMutex
	replicas int
	keys     []uint32
	hashMap  map[uint32]string
	shards   map[string]*sql.DB
}

func NewShardManager(replicas int) *ConsistentHashShardManager {
	return &ConsistentHashShardManager{
		replicas: replicas,
		hashMap:  make(map[uint32]string),
		shards:   make(map[string]*sql.DB),
	}
}

func (sm *ConsistentHashShardManager) AddShard(shardID string, db *sql.DB) {
	sm.mu.Lock()
	defer sm.mu.Unlock()
	sm.shards[shardID] = db
	for i := 0; i < sm.replicas; i++ {
		hash := crc32.ChecksumIEEE([]byte(fmt.Sprintf("%s-vnode-%d", shardID, i)))
		sm.keys = append(sm.keys, hash)
		sm.hashMap[hash] = shardID
	}
	sort.Slice(sm.keys, func(i, j int) bool { return sm.keys[i] < sm.keys[j] })
}

func (sm *ConsistentHashShardManager) GetShardForKey(entityKey string) (*sql.DB, string, error) {
	sm.mu.RLock()
	defer sm.mu.RUnlock()
	if len(sm.keys) == 0 {
		return nil, "", fmt.Errorf("no shards available")
	}
	hash := crc32.ChecksumIEEE([]byte(entityKey))
	idx := sort.Search(len(sm.keys), func(i int) bool { return sm.keys[i] >= hash })
	if idx == len(sm.keys) {
		idx = 0
	}
	shardID := sm.hashMap[sm.keys[idx]]
	return sm.shards[shardID], shardID, nil
}

// ============================================================================
// 2. SAGA PATTERN ORCHESTRATOR (Distributed Transaction Rollback)
// ============================================================================
type SagaStep struct {
	Name       string
	Action     func(ctx context.Context) error
	Compensate func(ctx context.Context) error
}

type SagaOrchestrator struct {
	steps []SagaStep
}

func NewSagaOrchestrator() *SagaOrchestrator {
	return &SagaOrchestrator{}
}

func (s *SagaOrchestrator) AddStep(name string, action, compensate func(ctx context.Context) error) {
	s.steps = append(s.steps, SagaStep{Name: name, Action: action, Compensate: compensate})
}

func (s *SagaOrchestrator) Execute(ctx context.Context) error {
	var executedSteps []SagaStep
	for _, step := range s.steps {
		if err := step.Action(ctx); err != nil {
			for i := len(executedSteps) - 1; i >= 0; i-- {
				compStep := executedSteps[i]
				if compErr := compStep.Compensate(ctx); compErr != nil {
					fmt.Printf("[CRITICAL DLQ] SAGA compensation failed on %s: %v\n", compStep.Name, compErr)
				}
			}
			return fmt.Errorf("SAGA failed at '%s': %w", step.Name, err)
		}
		executedSteps = append(executedSteps, step)
	}
	return nil
}

// ============================================================================
// 3. LEAST-CONNECTIONS LOAD BALANCER
// ============================================================================
type LeastConnNode struct {
	Endpoint          string
	ActiveConnections atomic.Int64
	Healthy           atomic.Bool
}

type LeastConnBalancer struct {
	nodes []*LeastConnNode
}

func (lb *LeastConnBalancer) SelectNode() *LeastConnNode {
	var selected *LeastConnNode
	minConns := int64(^uint64(0) >> 1)
	for _, n := range lb.nodes {
		if !n.Healthy.Load() {
			continue
		}
		conns := n.ActiveConnections.Load()
		if conns < minConns {
			minConns = conns
			selected = n
		}
	}
	if selected != nil {
		selected.ActiveConnections.Add(1)
	}
	return selected
}
