package bridge_test

import (
	"strings"
	"testing"

	"github.com/AntoinePoisson/finite-goods/engine/bridge"
)

func TestInvalidJSON(t *testing.T) {
	t.Parallel()

	result := bridge.ApplyJSON("not-json")
	if !strings.Contains(result, `"code":"INVALID_JSON"`) {
		t.Fatalf("unexpected result: %s", result)
	}
}
