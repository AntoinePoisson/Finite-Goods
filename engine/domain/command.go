package domain

import "time"

type CommandType string

const (
	ReserveObject      CommandType = "RESERVE_OBJECT"
	BeginPayment       CommandType = "BEGIN_PAYMENT"
	ReturnFromCheckout CommandType = "RETURN_FROM_CHECKOUT"
	ConfirmPayment     CommandType = "CONFIRM_PAYMENT"
	ExpireReservation  CommandType = "EXPIRE_RESERVATION"
	RefundOrder        CommandType = "REFUND_ORDER"
)

type Command struct {
	Type             CommandType `json:"type"`
	ObjectID         string      `json:"objectId,omitempty"`
	OrderID          string      `json:"orderId,omitempty"`
	EventID          string      `json:"eventId"`
	Now              time.Time   `json:"now"`
	ExpiresAt        time.Time   `json:"expiresAt,omitempty"`
	PaymentReference string      `json:"paymentReference,omitempty"`
	Customer         Customer    `json:"customer,omitempty"`
}
