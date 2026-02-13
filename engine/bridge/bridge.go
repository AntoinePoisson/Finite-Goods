package bridge

import (
	"encoding/json"

	"github.com/AntoinePoisson/finite-goods/engine/application"
	"github.com/AntoinePoisson/finite-goods/engine/domain"
)

type Request struct {
	World   domain.World   `json:"world"`
	Command domain.Command `json:"command"`
}

func ApplyJSON(input string) string {
	var request Request
	if err := json.Unmarshal([]byte(input), &request); err != nil {
		return marshal(application.Result{World: request.World, Code: "INVALID_JSON", Error: "invalid engine request"})
	}
	return marshal(application.Apply(request.World, request.Command))
}

func marshal(result application.Result) string {
	output, err := json.Marshal(result)
	if err != nil {
		return `{"code":"ENCODING_ERROR","error":"could not encode engine result"}`
	}
	return string(output)
}
