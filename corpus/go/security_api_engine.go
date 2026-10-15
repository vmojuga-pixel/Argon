package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"io"
	"time"
)

// ============================================================================
// 1. SECURE SECRET STORAGE: AES-256-GCM Authenticated Encryption
// ============================================================================
type SecretVault struct {
	masterKey []byte
}

func NewSecretVault(key32Byte []byte) (*SecretVault, error) {
	if len(key32Byte) != 32 {
		return nil, errors.New("master key must be 32 bytes for AES-256")
	}
	return &SecretVault{masterKey: key32Byte}, nil
}

func (v *SecretVault) EncryptSecret(plaintext string) (string, error) {
	block, err := aes.NewCipher(v.masterKey)
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	ciphertext := aesGCM.Seal(nonce, nonce, []byte(plaintext), nil)
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

func (v *SecretVault) DecryptSecret(encodedCipher string) (string, error) {
	data, err := base64.StdEncoding.DecodeString(encodedCipher)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(v.masterKey)
	if err != nil {
		return "", err
	}
	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonceSize := aesGCM.NonceSize()
	if len(data) < nonceSize {
		return "", errors.New("ciphertext too short")
	}
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := aesGCM.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		return "", err
	}
	return string(plaintext), nil
}

// ============================================================================
// 2. CSRF PROTECTION: HMAC Token Generator & Verifier
// ============================================================================
func GenerateCSRFToken(sessionID string, secret []byte) string {
	mac := hmac.New(sha256.New, secret)
	mac.Write([]byte(sessionID))
	return base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
}

func VerifyCSRFToken(sessionID, token string, secret []byte) bool {
	expected := GenerateCSRFToken(sessionID, secret)
	return hmac.Equal([]byte(expected), []byte(token))
}

// ============================================================================
// 3. API DESIGN: Cursor-Based Pagination
// ============================================================================
type PageCursor struct {
	LastID        string    `json:"last_id"`
	LastTimestamp time.Time `json:"last_ts"`
}

func EncodeCursor(id string, ts time.Time) (string, error) {
	b, err := json.Marshal(PageCursor{LastID: id, LastTimestamp: ts})
	if err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}

func DecodeCursor(encoded string) (*PageCursor, error) {
	b, err := base64.RawURLEncoding.DecodeString(encoded)
	if err != nil {
		return nil, err
	}
	var c PageCursor
	if err := json.Unmarshal(b, &c); err != nil {
		return nil, err
	}
	return &c, nil
}
