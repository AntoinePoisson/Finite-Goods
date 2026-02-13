//go:build js && wasm

package main

import (
	"syscall/js"

	"github.com/AntoinePoisson/finite-goods/engine/bridge"
)

func main() {
	js.Global().Set("finiteGoodsApply", js.FuncOf(apply))
	select {}
}

func apply(_ js.Value, args []js.Value) any {
	if len(args) != 1 {
		return `{"code":"INVALID_JSON","error":"expected one argument"}`
	}
	return bridge.ApplyJSON(args[0].String())
}
