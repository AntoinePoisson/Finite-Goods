package domain

import "errors"

var (
	ErrObjectNotFound     = errors.New("object not found")
	ErrOrderNotFound      = errors.New("order not found")
	ErrObjectUnavailable  = errors.New("object is no longer available")
	ErrReservationExpired = errors.New("reservation has expired")
	ErrInvalidTransition  = errors.New("invalid state transition")
	ErrInvalidCommand     = errors.New("invalid command")
	ErrMissingIdentifier  = errors.New("command identifiers are required")
)
